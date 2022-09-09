'use strict';

const modelName                 = 'User';
const Joi                       = require('@hapi/joi');
const { UserModel,
    CategoryModel,
    ConnectionsModel,
    OrderModel,
    OtpModel,
    SessionModel,
    ProductModel,
    ReviewModel,
    ServiceModel,
    UserPostsModel,
    StateModel,
    CibilModel,
    FileModel,
    RoleModel }                 = require('@database');
const dbModels                  = require('@database');
const CONSTANT                  = require('@lib/constant');
const Auth                      = require("@middleware/authorization");
const UTILS                     = require('@lib/utils');
const ejs                       = require('ejs');
const fs                        = require('fs');
const path                      = require('path');
const moment                    = require('moment');
const mail                      = require('@lib/mailer');
const ObjectId                  = require('mongodb').ObjectId;
const FILE_UPLOAD               = require('@lib/file_upload');
const excel                     = require("exceljs");
const _                         = require('lodash');
const oracledb                  = require('@lib/oracledb');
const bcrypt                    = require('bcrypt');


const login = async (req, res, next) => {

    try {
        const schema = Joi.object({
            email: Joi.string().required(),
            password: Joi.string().required()
        });
        
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        let user = await UserModel.findOne({email: req.body.email}, {password: 0});
        if (!user) return res.status(400).send({error: `User ${CONSTANT.NOT_EXISTS} ${req.body.email}`});

        let validate = await user.isValidPassword(req.body.password);
        validate = !validate ? CONSTANT.INVALID_CREDENTIALS : !user.active ? 'User'+CONSTANT.INACTIVE : null;
        if (validate) return res.status(400).send({error: validate});

        user = UTILS.cloneObject(user);
        user.token = await Auth.generateJWTToken({userId: user._id, type: modelName});

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: user
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


const validateLogin = async (req, res, next) => {
    try {
        return res.status(200).send(req.user ? { result : { msg :'Token is valid!',status:'success' } } : { error: 'Token is not valid!' });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const logout = async (req, res, next) => {
    try {
        let token = (req.headers['authorization'] || '').toString();

        await SessionModel.updateOne({token: token, logout: false}, {$set: {logout: true}});

        return res.status(200).send({ result: 'Session successfully logged out.','status':true });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};



const registration = async (req, res, next) => {
    try {
        let user = await FILE_UPLOAD.uploadMultipleFile(req);

        const schema = Joi.object({
            email: Joi.string().required(),
            phoneNumber: Joi.number().required(),
            address: Joi.string().required(),
            designation: Joi.string().required(),
            password: Joi.string().required(),
            role: Joi.string().required(),
            files: Joi.array().required(),
            firstName: Joi.string().trim(),
            lastName: Joi.string().trim(),
            state:Joi.array().required()
        });
        
        const { error } = schema.validate(user);
        if (error) return res.status(400).send({ error });

        let validate = await UserModel.countDocuments({$or: [{email: user.email}, {phoneNumber: user.phoneNumber}]});
        if (validate) return res.status(400).send({error: `User ${CONSTANT.EXISTS} ${user.email} or ${user.phoneNumber}`});

        let files = user.files;
        if (files.length) {
            user.file = files.filter(e => e.fieldName == 'file').map(file => file._id)[0];
        }
        delete user.files;

        user.role = user.role || ((await RoleModel.findOne({code: 'UNDER_WRITER'})) || {})._id || '';
        user.active = true;
        user.firstLogin = true;
        user.online = true;
        user = new UserModel(user);
        user = await user.save();

        if (user.email) {
         
            let compiled = ejs.compile(fs.readFileSync(path.resolve(__dirname, '../../docs/email_templates/welcome.ejs'), 'utf8')),
                dataToCompile = {
                    password: 'IKFL@123#',
                    email: user.email,
                    firstLogin:true,
                    url:process.env.WEBSITE_URL,
                    userName: `${user.firstName || ''} ${user.lastName || ''}`,
                };

            await mail.sendMail([user.email], 'Welcome to IKFL Kisan Finance', compiled(dataToCompile));
        }

        if (!user) return res.status(400).send({error: "User registration failed"});

        user = UTILS.cloneObject(user);
        delete user.password;
        delete user.registerDevices;



        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: 'User Created successfully'
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};



const validateEmail = async (req, res, next) => {
    try {
        const schema = Joi.object({
            email: Joi.string().required()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send({ error });

        let query = {email: req.body.email};
        if (req.query._id) query._id = {$ne: req.query._id};
        const validate = await UserModel.countDocuments(query);
        if (validate) return res.status(200).send({error: "Email id already exists!"});

        return res.status(200).send({result: "Email id is available!"});
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const getUserProfile = async (req, res, next) => {
    try {
        req.user = req.user && req.user._id ? req.user : {_id: ''};
        if (!req.query._id && !req.query.userName) return res.status(200).send({error: "User id/name is required!"});
        let roles = ((await RoleModel.find({code: {$in: [process.env.ROLE_PROFESSIONAL, process.env.ROLE_USER, 'SUPER_ADMIN']}})) || []).map(e => e._id);
        let query = {role: {$in: roles}};
        if (req.query._id) query._id = req.query._id
        // if (req.query.userName) query.userName = new RegExp(req.query.userName, "i");
        if (req.query.userName) query.userName = req.query.userName;
        let user = await UserModel.findOne(query).populate('file', 'name original path thumbnail smallFile').populate('coverPhoto', 'name original path thumbnail smallFile');
        if (!user) return res.status(200).send({error: "No user found!"});

        const productsCount = await dbModels.ProductModel.countDocuments({createdBy: user._id});
        const reviewsCount = await dbModels.ReviewModel.countDocuments({status: 'APPROVED', _id: {$in: (user.overallReview || {}).review}});
        const data = {};

        let records = [
            {model: 'ConnectionsModel', query: {$or: [
                {requestedTo: ObjectId(req.user._id), createdBy: ObjectId(user._id)},
                {createdBy: ObjectId(req.user._id), requestedTo: ObjectId(user._id)}
            ], status: {$in: ["APPROVED", "REQUESTED"]}}, value: 'connections', filter: {}},
            {model: 'ConnectionsModel', query: {requestedTo: user._id, status: "REQUESTED"}, value: 'requestedConnections', filter: {_id: 1}},
            {model: 'CategoryModel', query: {_id: {$in: user.category}}, value: 'categories', filter: {}}
        ].map(async record => {
            data[record.value] = (req.user._id || record.value != 'connections') ? UTILS.cloneObject(await dbModels[record.model].find(record.query, record.filter).sort({updatedAt: -1}).limit(10).skip(0).populate('files', 'name original path thumbnail smallFile')) : [];
            return true;
        });

        await Promise.all(records);

        const record = {
            _id: user._id,
            email: user.email,
            phoneNumber: user.phoneNumber,
            userName: user.userName,
            businessName: user.businessName,
            gstNumber: user.gstNumber,
            firstName: user.firstName,
            lastName: user.lastName,
            biography: user.biography,
            role: user.role,
            private: user.private,
            file: user.file,
            experience: user.experience,
            age: user.age,
            quoteTagLine: user.quoteTagLine,
            coverPhoto: user.coverPhoto,
            favourites: user.favourites,
            socialLink: user.socialLink || '',
            bankDetails: user.bankDetails || {},
            location: user.location || {},
            createdAt: user.createdAt,
            productsCount: productsCount,
            reviewsCount: reviewsCount,
            category: (data.categories || []).map(e => e.name),
            overallReview: user.overallReview,
            connectionsCount: user.connectionsCount >= 0 ? user.connectionsCount : 0,
            postsCount: user.postsCount,
            requestedConnectionCount: user._id.toString() != req.user._id.toString() ? 0 : data.requestedConnections.length,
            connectionRecord: {}
        };

        record.connectionRecord = user._id.toString() == req.user._id.toString() ? {} : data.connections.find(e => (e.status == 'APPROVED') || (e.status == 'REQUESTED')) || {};

        return res.status(200).send({result: record});
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};



const getSearchList = async (req, res, next) => {
    try {
        let query = req.query;
        if (query.name) query.name = new RegExp(query.name, "i");
        delete query.private;

        let docs = {};
        docs.categories = await CategoryModel.find(query, {name: 1, _id: 1}).sort({createdAt: -1});
        // query.role = ((await RoleModel.findOne({code: process.env.ROLE_PROFESSIONAL})) || {})._id || '';
        query.private = JSON.parse((req.query.private || "false").toLowerCase());
        docs.users = await UserModel.find({private: false, $or: [{userName: query.name}, {firstName: query.name}, {lastName: query.name}]}, {firstName: 1, lastName: 1, role: 1, userName: 1, _id: 1}).sort({userName: -1});

        return res.status(200).send({result: UTILS.cloneObject(docs)});
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


const uploadProfilePhoto = async (req, res, next) => {
    try {
        let file = ((await FILE_UPLOAD.uploadMultipleFile(req)).files || [])[0];
        
        if (!file || !file._id) return res.status(400).send({error: "File upload failed"});
        
        const user = await UserModel.updateOne({_id: req.query.id || req.user._id}, {$set: {file: file._id}});
        if (!user) return res.status(400).send({error: "User update failed"});

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: file.path
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const get = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = {};
        if (Object.keys(req.query).length) query = req.query;
        else query = {_id: req.user._id};
        delete query.pagination;
        delete query.limit;

        if (query._id) query._id = ObjectId(query._id);
        let docs = {};
        docs.userData = await UserModel.find(query, {password: 0, registerDevices: 0}).sort({createdAt: -1})
                    .limit(limit).skip(pagination*limit)
                    .populate('role', 'name code')
                    .populate('state', 'name');
    
        docs.applicationCount = await CibilModel.countDocuments();
        docs.userCount = await UserModel.countDocuments();
        docs.applicationPendingCount = await CibilModel.countDocuments({finalStatus:false});
        docs.applicationApprovedCount = await CibilModel.countDocuments({finalStatus:true});
        
       
        return res.status(200).send({ result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


const update = async (req, res, next) => {
    try {
        
        if (!req.params.id) return res.status(400).json({error: "user id is required"});
        let updateUser = req.body;
        const schema = Joi.object({
            email: Joi.string().required(),
            phoneNumber: Joi.number().required(),
            address: Joi.string().required(),
            designation: Joi.string().required(),
            password: Joi.string(),
            role: Joi.string().required(),
            state:Joi.array().required(),
            firstName: Joi.string().trim(),
            lastName: Joi.string().trim(),
            active: Joi.boolean().required()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send({ error });
       
        req.body.updatedBy = req.user._id;
    
        if(req.body.password){
        const salt = await bcrypt.genSalt(parseInt(process.env.HASH_COST));
        req.body.password = await bcrypt.hash(req.body.password, salt);
        }
        updateUser = await UserModel.updateOne({_id: req.params.id}, {$set: req.body});
        if (!updateUser) return res.status(400).send({error: "User update failed"});

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "User updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const updateStatus = async (req, res, next) => {
    try {
        if (!req.params.id) return res.status(400).json({error: "User id is required"});
        
        const schema = Joi.object({
            active: Joi.boolean(),
            private: Joi.boolean()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send({ error });

        req.body.updatedBy = req.user._id;
        const user = await UserModel.findOneAndUpdate({_id: req.params.id}, {$set: req.body}, {returnOriginal: false});
        if (!user) return res.status(400).send({error: "User Status update failed"});

     

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "User Status updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

//get users and professional list by via professional id
const getUserList = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let where = {};
       
        if(req.query._id) where._id = ObjectId(req.query._id);
        if(req.query.role) where.role = ObjectId(req.query.role); 

        where = req.query;  
        delete where.pagination;
        delete where.limit;
        
        let docs = await UserModel.find(where).sort({createdAt: -1}).limit(limit).skip(pagination*limit).populate('category', 'name').populate('role', 'name');
        docs = UTILS.cloneObject(docs);
        let countData = await UserModel.countDocuments();
        return res.status(200).send({ result: docs ,countData:countData});
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const remove = async (req, res, next) => {
    try {
       
        let findrole = await RoleModel.findOne({_id:ObjectId(req.user.role)});
       
        if (findrole.code == "SUPER_ADMIN")
        {
           
            if (!req.params.id) return res.status(400).json({error: "Professional Id is required"});
       
        }else{
        if (req.params.id.toString() != req.user._id.toString()) return res.status(400).json({error: "You don't have access to delete this user"});
        }
        const schema = Joi.object({
            id: Joi.string().required()
        });
       
        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });
        const userId = ObjectId(req.params.id);
        const user = await UserModel.findOne({_id: userId});
        let connections = await ConnectionsModel.find({$or: [{requestedTo: userId}, {createdBy: userId}]});

        await UserModel.remove({_id: userId});
        await FileModel.remove({_id: {$in: [user.file, user.coverPhoto]}});
        await ConnectionsModel.remove({_id: {$in: connections.map(e => e._id)}});
        await OrderModel.remove({orderedBy: userId});
        await OtpModel.remove({userId: userId});
        // await ReviewModel.remove({createdBy: userId});
        // await ProductModel.remove({createdBy: userId});
        // await ServiceModel.remove({createdBy: userId});
        await ReviewModel.updateOne({createdBy: userId}, {$set: {active: false}});
        await ProductModel.updateOne({createdBy: userId}, {$set: {active: false}});
        await ServiceModel.updateOne({createdBy: userId}, {$set: {active: false}});
        // change it to update method
        await UserPostsModel.remove({createdBy: userId});

        let connectionList = [];
        connections.forEach(e => {
            if (e.status == 'APPROVED') {
                connectionList.push(e.requestedTo);
                connectionList.push(e.createdBy);
            }
        });
        connectionList = [...new Set(connectionList)];

        await UserModel.updateMany({_id: {$in: connectionList}}, {$inc: {connectionsCount: -1}});
        await UserPostsModel.updateMany({$pull: {likes: userId, comments: {commentedBy: userId}}});

        return res.status(200).send({ result: "User deleted successfully" });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

//user data Export to Excel
const exportUserList = async (req, res, next) => {
    try {
        let where = {};
        if(req.query.role) {where = {role : ObjectId(req.query.role)}}
        where = req.query;  

        let docs = await UserModel.find(where).populate('category', 'name').populate('role', 'name');
        docs = UTILS.cloneObject(docs);
       
        let userData = [];
        docs.forEach((obj) => {
        userData.push({
        firstName: obj.firstName,
        lastName: obj.lastName,
        userName: obj.userName,
        email: obj.email,
        phoneNumber: obj.phoneNumber,
        biography: obj.biography,

      });

    });
   
    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("userData");
    worksheet.columns = [
      { header: "first Name", key: "firstName", width: 25 },
      { header: "last Name", key: "lastName", width: 25 },
      { header: "User Name", key: "userName", width: 25 },
      { header: "Email Address", key: "email", width: 25 },
      { header: "Contact Number", key: "phoneNumber", width: 25 },
      { header: "Biography", key: "biography", width: 25 },

    ];
    // Add Array Rows
    worksheet.addRows(userData);
    //console.log(userData) 
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "userDetails.xlsx"
    );
    return workbook.xlsx.write(res).then(function () {
        res.status(200).end();
      });
        //return res.status(200).send({ result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const changePassword = async (req, res, next) => {
    let data = req.body;
    try {
        const schema = Joi.object({
            oldPassword:Joi.string().required(),
            newPassword: Joi.string().required(),
            confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
           
        });
        
        const { error } = schema.validate(data);
        if (error) return res.status(400).json({ error });

            let user = await UserModel.findOne({_id: ObjectId(req.user._id)}, {password: 0});
            if (!user) return res.status(400).send({error: `User does not exists`});
    
            let validate = await user.isValidPassword(req.body.oldPassword);
            if(validate)
            {
                const salt = await bcrypt.genSalt(parseInt(process.env.HASH_COST));
                let password = await bcrypt.hash(req.body.newPassword, salt);
                let updatePassword = await UserModel.updateOne({_id:  req.user._id}, {$set: {password:password,firstLogin:false}});
                 if (updatePassword)
                 {
                    
                    let compiled = ejs.compile(fs.readFileSync(path.resolve(__dirname, '../../docs/email_templates/changePasswordMail.ejs'), 'utf8')),
                    dataToCompile = {
                        userName: `${user.firstName || ''} ${user.lastName || ''}`,
                    };
    
                    await mail.sendMail([user.email], 'Password Change Successfully', compiled(dataToCompile));
 
                    let token = (req.headers['authorization'] || '').toString();
                    await SessionModel.updateOne({token: token, logout: false}, {$set: {logout: true}});
                    

                    return res.status(200).send({ result : { msg :'Password change successfully..!!!',status:'SUCCESS!' } });
                    
                 }else{ 
                    return res.status(400).json({error: "Password update failed"});
                }
                

            }else{
                validate = !validate ? CONSTANT.INVALID_PASSWORD : !user.active ? 'User'+CONSTANT.INACTIVE : null;
                if (validate) return res.status(400).send({error: validate});
            
            }

        

    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};
//forget password forgetPassword

const forgetPassword = async (req, res, next) => {
    try {
        const schema = Joi.object({
            email: Joi.string().required()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        const user = await UserModel.findOne({ email: req.body.email }, { firstName: 1, lastName: 1, email: 1 });
        if (!user) return res.status(400).send({ error: `User ${CONSTANT.NOT_EXISTS} ${req.body.email}` });

        const checkuser = await UserModel.findOne({ email: req.body.email,active:true });
        if (!checkuser) return res.status(400).send({ error: "You are not authorized to change your password. Please contact to admin" });

        const response = await emailOtp(user);
        if (response.error) return res.status(400).send({ error: response.error, message: "Failed to send OTP!" });

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: `OTP Sent successfully, please check your email.`
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


const emailOtp = async (user) => {
    try {
        if (!user.email) return { error: 'Email id is required!' };

        let randomNumber = await UTILS.getRandomNumber();

        await OtpModel.updateOne({ email: user.email }, { $set: { token: '', active: false } });
        
        let otp = {
            type: "OTP",
            token: randomNumber,
            userId: user._id,
            email: user.email,
            expiry: moment().add(10, 'm').valueOf(),
            active: true
        };
        otp = new OtpModel(otp);
        otp = await otp.save();

        let compiled = ejs.compile(fs.readFileSync(path.resolve(__dirname, '../../docs/email_templates/otpmail.ejs'), 'utf8')),
            dataToCompile = {
                token: randomNumber,
                userName: `${user.firstName || ''} ${user.lastName || ''}`,
                register: false
            };

        await mail.sendMail([user.email], 'Kisan Finance : Forget password OTP', compiled(dataToCompile));

        return { result: 'Success' };
    } catch (error) {
        return UTILS.errorHandler(error);
    }
};

const verifyEmailOtp = async (req, res, next) => {
    try {
        const schema = Joi.object({
            email: Joi.string().required(),
            token: Joi.number().required()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        const otp = await OtpModel.findOne({ email: req.body.email, token: req.body.token, active: true });
        if (!otp) return res.status(400).send({ error: "Your OTP is not valid!" });
        if (otp.expiry < moment().valueOf()) return res.status(400).send({ error: "OTP valid only for 10 minutes. Request for new token!" });

        let user = await UserModel.findOne({ _id: ObjectId(otp.userId) }, { password: 0 });
        if (!user) return res.status(400).send({ error: `User${CONSTANT.NOT_EXISTS}${req.body.phoneNumber}` });
        user = UTILS.cloneObject(user);

        const salt = await bcrypt.genSalt(parseInt(process.env.HASH_COST));
        let password = await bcrypt.hash('IKFL@1234#', salt);
        let updatePassword = await UserModel.updateOne({email:  user.email}, {$set: {password:password,firstLogin:false}});
        
        if (updatePassword) {
         
            let compiled = ejs.compile(fs.readFileSync(path.resolve(__dirname, '../../docs/email_templates/passwordReset.ejs'), 'utf8')),
                dataToCompile = {
                    password: 'IKFL@1234#',
                    email: user.email,
                    firstLogin:true,
                    url:process.env.WEBSITE_URL,
                    userName: `${user.firstName || ''} ${user.lastName || ''}`,
                };

            await mail.sendMail([user.email], 'Password changes successfully', compiled(dataToCompile));
        }
            await OtpModel.updateOne({ email: otp.email }, { $set: { token: '', active: false } });


  
        

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: user,
        });
    } catch (error) {
        return UTILS.errorHandler(error);
    }
};

const resendEmailOtp = async (req, res, next) => {
    try {
        const schema = Joi.object({
            email: Joi.string().required()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        const user = await UserModel.findOne({ email: req.body.email });
        if (!user) return res.status(400).send({ error: `User ${CONSTANT.NOT_EXISTS} ${req.body.email}` });

        
        const checkuser = await UserModel.findOne({ email: req.body.email,active:true });
        if (!checkuser) return res.status(400).send({ error: "You are not authorized to change your password. Please contact to admin" });


        let otp = await OtpModel.findOne({ email: req.body.email, active: true });
        if (otp) otp = UTILS.cloneObject(otp);
        let randomNumber = await UTILS.getRandomNumber();
        const expiryTime = moment().add(10, 'm').valueOf();
        if (otp && otp.expiry < moment().valueOf()) {
            await OtpModel.updateOne({ _id: otp._id }, { $set: { token: randomNumber, expiry: expiryTime } });
        } else if (otp && otp.expiry >= moment().valueOf()) {
            randomNumber = otp.token;
        } else {
            otp = {
                type: "OTP",
                token: randomNumber,
                userId: user._id,
                email: user.email,
                expiry: expiryTime,
                active: true
            };
            otp = new OtpModel(otp);
            otp = await otp.save();
        }

        let compiled = ejs.compile(fs.readFileSync(path.resolve(__dirname, '../../docs/email_templates/otpmail.ejs'), 'utf8')),
            dataToCompile = {
                token: randomNumber,
                userName: `${user.firstName || ''} ${user.lastName || ''}`,
                register: false
            };

        await mail.sendMail([user.email], 'Kisan Finance : Resend OTP', compiled(dataToCompile));

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: `OTP resent successfully, please check your email.`
        });
    } catch (error) {
        return UTILS.errorHandler(error);
    }
};


module.exports = {
    login,
    logout,
    registration,
    validateEmail,
    validateLogin,
    uploadProfilePhoto,
    get,
    update,
    remove,
    getUserProfile,
    getSearchList,
    updateStatus,
    getUserList,
    exportUserList,
    changePassword,
    verifyEmailOtp,
    resendEmailOtp,
    forgetPassword
};