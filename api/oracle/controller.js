'use strict';

const modelName                 = 'Oracle';
const Joi                       = require('@hapi/joi');
const {StateModel,
    BranchModel,
    CropMasterModel,
    AssetsCategoryModel,
    IncomeMitigantsModel,
    UserModel }                 = require('@database');
const CONSTANT                  = require('@lib/constant'); 
const UTILS                     = require('@lib/utils');
const FILE_UPLOAD               = require('@lib/file_upload');
const oracledb                  = require('@lib/oracledb');
const oracledbConn              = require('../../lib/oracledb');
const readXlsxFile              = require("read-excel-file/node");
const ObjectId                  = require('mongodb').ObjectId;
      


const get = async (req, res, next) => {
    try {
        
        let query = req.query;
        let conn = await oracledbConn.connect();
        let docs = await conn.execute(`select 
        "Application Received Date",
        "Branch Name",
        "Product",
        "Loan Purpose Description",
        "Loan Amount Requested",
        "Net LTV",
        "Loan Application Type",
        "Customer Name",
        "ASSET_MODEL",
        "Application Number",
        PI.AGE
        from IF_NEO_CAS_LMS.APPLICATION_DETAILS_MV LEFT JOIN IF_NEO_CAS_LMS.Loan_application LA ON
        LA.APPLICATION_NUMBER = IF_NEO_CAS_LMS.APPLICATION_DETAILS_MV."Application Number" LEFT JOIN IF_NEO_CAS_LMS.party PD ON
        PD.LOAN_APPLICATION_FK = LA.ID LEFT JOIN IF_NEO_CAS_LMS.customer CD ON
        CD.ID = PD.CUSTOMER LEFT JOIN IF_NEO_CAS_LMS.person_info PI ON
        PI.ID = CD.PERSON_INFO  where "Application Number" = '${query.applicationNumber}' AND PD.PARTY_ROLE=0`);
       
        let rowsdata = docs.rows[0];
        if(!rowsdata) return res.status(400).json({result:"Application number is not found",status:"Error"});
        let branch = await BranchModel.find({name:rowsdata[1]}).populate('state', 'name').populate('cropmaster','name');
        let cropMaster = await CropMasterModel.find({state:{$in:branch.map(e => e.state._id)}}).sort({name:1});
        let HPandAssestCategory = await AssetsCategoryModel.find({state:{$in:branch.map(e => e.state._id)},modelName:{$regex : new RegExp(rowsdata[8],'i')},type:rowsdata[2]=="Used Tractor"?"USED":"NEW"});
        
        const countData = await UserModel.countDocuments({state:{$in:branch.map(e => e.state._id)},_id:ObjectId(req.user._id)});
        // if(branch[0].state.name == )
        if(countData < 1)  return res.status(401).send({ status:"Error",result:"You are not authorised to access this application number"});
        let result = {};
            result.oracle = docs;
            result.branch = branch;
            result.cropMaster = cropMaster;
            result.HPandAssestCategory = HPandAssestCategory;

        return res.status(200).send({ result: result ,status: CONSTANT.REQUESTED_CODES.SUCCESS});
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const getStates = async (req, res, next) => {
    try {

        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
     
        delete query.pagination;
        delete query.limit;

        const states = await StateModel.find(query).sort({name: 1}).limit(limit).skip(pagination*limit);
        const countData = await StateModel.countDocuments(query);
        return res.status(200).send({result: states,countData:countData});
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const createBranch = async (req, res, next) => {
    let branch = req.body;
    branch.active = true;

    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            branchId: Joi.number().required(),
            branchCode: Joi.string().required(),
            state: Joi.string().required(),
            active: Joi.boolean().required(),
            customFields: Joi.object()
        });
    
        const { error } = schema.validate(branch);
        if (error) return res.status(400).json({ error });


        branch.createdBy = req.user._id;
        branch.updatedBy = req.user._id;

        branch = new BranchModel(branch);
        branch = await branch.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: branch
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const getBranch = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        if (query.name) query.name = new RegExp(query.name, "i");
        delete query.pagination;
        delete query.limit;

        let docs = await BranchModel.find(query).sort({name: 1}).limit(limit).skip(pagination*limit)
        .populate('state','name');
        const countData = await BranchModel.countDocuments(query);
        return res.status(200).send({ result: docs ,countData:countData});
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const updateBranch = async (req, res, next) => {
    
    try {
        if (!req.params.id) return res.status(400).json({error: "Branch id is required"});
        let branch = req.body;
        const schema = Joi.object({
            name: Joi.string().required(),
            branchId: Joi.number().required(),
            branchCode: Joi.string().required(),
            state: Joi.string().required(),
            active: Joi.boolean().required(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

       
        req.body.updatedBy = req.user._id;

        branch = await BranchModel.updateOne({_id: req.params.id}, {$set: req.body});
        if (!branch) return res.status(400).json({error: "Branch update failed"});
        
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Branch updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};
//Bulk import profession
const importBranchList = async (req, res, next) => {
    let branch = await FILE_UPLOAD.uploadMultipleFile(req, true, 'branch');
    //branch.active = true;

    try {
        const schema = Joi.object({
            files: Joi.array(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(branch);
        if (error) return res.status(400).json({ error });

        if (!branch.files.length) return res.status(400).json({ error: "Excel File is required" });
        if (branch.files[0].ext != '.xlsx') return res.status(400).json({ error: "Only Excel File format will be processed" });


        let rows = await readXlsxFile(branch.files[0].path).then(r => r);
        if (!rows || !rows.length) console.log(" Excel file upload failed!");

        rows.shift();
        let headers = rows;
        // rows.shift();
        var arrayToInsert = [];
        for (var i = 0; i < rows.length; i++) {
            var oneRow = {
                branchId: headers[i][0],
                branchCode: headers[i][1],
                name: headers[i][2],
                state:  headers[i][3],
                active:true,
                createdBy :req.user._id
            };

            arrayToInsert.push(oneRow);
        }

       
        branch.name = branch.files[0].name;
        delete branch.files;
        let userUpdate = arrayToInsert.map(user => ({
            updateOne: {
              filter: {branchId:user.branchId},
              update: {$set: user},
              upsert: true
            }
          }));
           
            branch = await BranchModel.bulkWrite(userUpdate);
           
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: branch
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const createCropMaster = async (req, res, next) => {
    let cropMaster = req.body;
    cropMaster.active = true;

    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            state: Joi.string().required(),
            active: Joi.boolean().required(),
            customFields: Joi.object()
        });
    
        const { error } = schema.validate(cropMaster);
        if (error) return res.status(400).json({ error });


        cropMaster.createdBy = req.user._id;
        cropMaster.updatedBy = req.user._id;

        cropMaster = new CropMasterModel(cropMaster);
        cropMaster = await cropMaster.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: cropMaster
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const getCropMaster = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        if (query.name) query.name = new RegExp(query.name, "i");
        delete query.pagination;
        delete query.limit;

        let docs = await CropMasterModel.find(query).sort({name: 1}).limit(limit).skip(pagination*limit)
        .populate('state','name');
        const countData = await CropMasterModel.countDocuments(query);
        return res.status(200).send({ result: docs,countData:countData });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const updateCropMaster = async (req, res, next) => {
    
    try {
        if (!req.params.id) return res.status(400).json({error: "Crop master id is required"});
        let cropMaster = req.body;
        const schema = Joi.object({
            name: Joi.string().required(),
            state: Joi.string().required(),
            active: Joi.boolean().required(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

       
        req.body.updatedBy = req.user._id;

        cropMaster = await CropMasterModel.updateOne({_id: req.params.id}, {$set: req.body});
        if (!cropMaster) return res.status(400).json({error: "Crop master update failed"});
        
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Crop master updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};
//import crop master
const importCropMaster = async (req, res, next) => {
    let cropmaster = await FILE_UPLOAD.uploadMultipleFile(req, true, 'cropmaster');
    cropmaster.active = true;

    try {
        const schema = Joi.object({
            files: Joi.array(),
            active:Joi.boolean(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(cropmaster);
        if (error) return res.status(400).json({ error });

        if (!cropmaster.files.length) return res.status(400).json({ error: "Excel File is required" });
        if (cropmaster.files[0].ext != '.xlsx') return res.status(400).json({ error: "Only Excel File format will be processed" });


        let rows = await readXlsxFile(cropmaster.files[0].path).then(r => r);
        if (!rows || !rows.length) console.log(" Excel file upload failed!");

        rows.shift();
        let headers = rows;
        // rows.shift();
        var arrayToInsert = [];
        for (var i = 0; i < rows.length; i++) {
            var oneRow = {
                state: headers[i][0],
                name: headers[i][1],
                active:true,
                createdBy :req.user._id
            };

            arrayToInsert.push(oneRow);
        }

       
        cropmaster.name = cropmaster.files[0].name;
        delete cropmaster.files;
        let userUpdate = arrayToInsert.map(user => ({
            updateOne: {
              filter: {'name':user.name,'state':user.state},
              update: {$set: user},
              upsert: true
            }
          }));
          
            cropmaster = await CropMasterModel.bulkWrite(userUpdate);
           
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: cropmaster
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const incomeMitigants = async (req, res, next) => {
    let incomeMitigants = req.body;
    incomeMitigants.active = true;

    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            active: Joi.boolean().required(),
            customFields: Joi.object()
        });
    
        const { error } = schema.validate(incomeMitigants);
        if (error) return res.status(400).json({ error });


        incomeMitigants.createdBy = req.user._id;
        incomeMitigants.updatedBy = req.user._id;

        incomeMitigants = new IncomeMitigantsModel(incomeMitigants);
        incomeMitigants = await incomeMitigants.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: incomeMitigants
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const getIncomeMitigants = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        if (query.name) query.name = new RegExp(query.name, "i");
        delete query.pagination;
        delete query.limit;

        let docs = await IncomeMitigantsModel.find(query).sort({name: 1}).limit(limit).skip(pagination*limit);
        const countData = await IncomeMitigantsModel.countDocuments(query);
        return res.status(200).send({result: docs,countData:countData});
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const updateIncomeMitigants = async (req, res, next) => {
    
    try {
        if (!req.params.id) return res.status(400).json({error: "Income mitigants id is required"});
        let incomeMitigants = req.body;
        const schema = Joi.object({
            name: Joi.string().required(),
            active: Joi.boolean().required(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

       
        req.body.updatedBy = req.user._id;

        incomeMitigants = await IncomeMitigantsModel.updateOne({_id: req.params.id}, {$set: req.body});
        if (!incomeMitigants) return res.status(400).json({error: "Income mitigants update failed"});
        
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Income mitigants updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};
//import income
const importIncomeMitigants = async (req, res, next) => {
    let incomemitigants = await FILE_UPLOAD.uploadMultipleFile(req, true, 'incomemitigants');
    incomemitigants.active = true;

    try {
        const schema = Joi.object({
            files: Joi.array(),
            active:Joi.boolean(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(incomemitigants);
        if (error) return res.status(400).json({ error });

        if (!incomemitigants.files.length) return res.status(400).json({ error: "Excel File is required" });
        if (incomemitigants.files[0].ext != '.xlsx') return res.status(400).json({ error: "Only Excel File format will be processed" });


        let rows = await readXlsxFile(incomemitigants.files[0].path).then(r => r);
        if (!rows || !rows.length) console.log(" Excel file upload failed!");

        rows.shift();
        let headers = rows;
        // rows.shift();
        var arrayToInsert = [];
        for (var i = 0; i < rows.length; i++) {
            var oneRow = {
                name: headers[i][0],
                active:true,
                createdBy :req.user._id
            };

            arrayToInsert.push(oneRow);
        }

       
        incomemitigants.name = incomemitigants.files[0].name;
        delete incomemitigants.files;
        let userUpdate = arrayToInsert.map(user => ({
            updateOne: {
              filter: {'name':user.name},
              update: {$set: user},
              upsert: true
            }
          }));
          
            incomemitigants = await IncomeMitigantsModel.bulkWrite(userUpdate);
           
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: incomemitigants
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}
module.exports = {
    get,
    getStates,
    createBranch,
    getBranch,
    updateBranch,
    importBranchList,
    importCropMaster,
    updateCropMaster,
    createCropMaster,
    getCropMaster,
    getIncomeMitigants,
    importIncomeMitigants,
    updateIncomeMitigants,
    incomeMitigants         
};