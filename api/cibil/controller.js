'use strict';

const modelName                 = 'Cibil';
const Joi                       = require('@hapi/joi');
const { CibilModel,
    AssetsCategoryModel }       = require('@database');
const CONSTANT                  = require('@lib/constant'); 
const UTILS                     = require('@lib/utils');
const FILE_UPLOAD               = require('@lib/file_upload');
const oracledb                  = require('@lib/oracledb');
const readXlsxFile              = require("read-excel-file/node");
const excel                     = require("exceljs");
const moment                    = require('moment');
const ObjectId                  = require('mongodb').ObjectId;


const create = async (req, res, next) => {
    let cibil = req.body;
    cibil.active = true;
    cibil.finalStatus = false;
    cibil.status = false;

    try {
        const schema = Joi.object({
            applicationNumber:Joi.string().required(),
            name: Joi.string().required(),
            number: Joi.number(),
            email:Joi.string(),
            applicationReceivedDate:Joi.string().required(),
            branchName:Joi.string().required(),
            stateName:Joi.string().required(),
            product:Joi.string().required(),
            loanAppilicatonType:Joi.string().required(),
            assetModel:Joi.string().required(),
            rtrHeading:Joi.string().required(),
            loanPurpose:Joi.string().required(),
            ltv: Joi.string().required(),
            landHolding: Joi.string().required(),
            cashCrops: Joi.array(),
            attachements:Joi.string().required(),
            incomeMitigants: Joi.array(),
            incomeHeading:Joi.string().required(),
            pastTractorHandlingExperience: Joi.string().required(),
            rtr: Joi.string().required(),
            dealerCategory: Joi.string().required(),
            areaCategory: Joi.string().required(),
            assetCategory: Joi.string().required(),
            hpOfAsset: Joi.string().required(),
            newTractorHandledBy: Joi.string().required(),
            marginMoney: Joi.string().required(),
            age: Joi.string().required(),
            loanAmount: Joi.string().required(),
            cibilScore: Joi.number().required(),
            active: Joi.boolean().required(),
            status: Joi.boolean(),
            finalStatus: Joi.boolean(),
            customFields: Joi.object()
        });
    
        const { error } = schema.validate(cibil);
        if (error) return res.status(400).json({ error });

    

        cibil.createdBy = req.user._id;
        cibil.updatedBy = req.user._id;
        let validate = await CibilModel.countDocuments({applicationNumber: cibil.applicationNumber});
        if (validate) return res.status(400).send({error: 'This Application Number Already Register With Us'});

        cibil = new CibilModel(cibil);
        cibil = await cibil.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: cibil
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const get = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = {};
        if(req.query.updatedBy) query.updatedBy =  ObjectId(req.query.updatedBy);
        if(req.query.createdBy) query.createdBy =  ObjectId(req.query.createdBy);
        if(req.query.startDate && req.query.endDate) query['applicationReceivedDate'] = { $gte:new Date(req.query.startDate).toISOString(),$lte: new Date(req.query.endDate).toISOString()  };
        if(req.query.applicationNumber) query['applicationNumber'] =  req.query.applicationNumber;
        if(req.query.finalStatus) query['finalStatus'] =  req.query.finalStatus;
        if(req.query.cibilScore) query['cibilScore'] =  req.query.cibilScore;
        if(req.query.incomeHeading) query['incomeHeading'] =  new RegExp(req.query.incomeHeading,'i');
       
        
       
        
        delete query.pagination;
        delete query.limit;
       
        let userData = req.user.state;

        if(req.user.role.code == 'SUPERVISIOR') query['stateName'] = {$in:userData.map(e => new RegExp(e.name,'i'))};
        if(req.user.role.code == 'UNDER_WRITER') query['createdBy'] = req.user._id;
        
        
        let docs = await CibilModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit).populate('createdBy','_id firstName lastName').populate('updatedBy','_id firstName lastName').populate('cashCrops', '_id name').populate('incomeMitigants', '_id name');
        let countData = await CibilModel.countDocuments(query);
        
        return res.status(200).send({ result: docs,countData:countData });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const update = async (req, res, next) => {
    
    try {
        if (!req.params.id) return res.status(400).json({error: "cibil id is required"});
        let cibil = req.body;
        const schema = Joi.object({
            applicationNumber:Joi.string().required(),
            name: Joi.string().required(),
            number: Joi.number(),
            email:Joi.string(),
            applicationReceivedDate:Joi.string().required(),
            branchName:Joi.string().required(),
            stateName:Joi.string().required(),
            product:Joi.string().required(),
            loanAppilicatonType:Joi.string().required(),
            assetModel:Joi.string().required(),
            rtrHeading:Joi.string().required(),
            loanPurpose:Joi.string().required(),
            ltv: Joi.string().required(),
            landHolding: Joi.string().required(),
            cashCrops: Joi.array(),
            attachements:Joi.string().required(),
            incomeMitigants: Joi.array(),
            incomeHeading:Joi.string().required(),
            pastTractorHandlingExperience: Joi.string().required(),
            rtr: Joi.string().required(),
            dealerCategory: Joi.string().required(),
            areaCategory: Joi.string().required(),
            assetCategory: Joi.string().required(),
            hpOfAsset: Joi.string().required(),
            newTractorHandledBy: Joi.string().required(),
            marginMoney: Joi.string().required(),
            age: Joi.string().required(),
            loanAmount: Joi.string().required(),
            cibilScore: Joi.number().required(),
            active: Joi.boolean(),
            status: Joi.boolean(),
            finalStatus: Joi.boolean(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

  
        req.body.updatedBy = req.user._id;

        cibil = await CibilModel.updateOne({_id: req.params.id}, {$set: req.body});
        if (!cibil) return res.status(400).json({error: "cibil update failed"});
        
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "cibil updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const remove = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await CibilModel.deleteOne({_id: req.params.id});
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "cibil Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};
//assetsCategory
const assetsCategory = async (req, res, next) => {
    let assetsCategory = req.body;
    assetsCategory.active = true;

    try {
        const schema = Joi.object({
            state:Joi.string().required(),
            modelName: Joi.string().required(),
            category: Joi.string().required(),
            hp: Joi.string().required(),
            type: Joi.string().required(),
            active: Joi.boolean().required(),
            customFields: Joi.object()
        });
    
        const { error } = schema.validate(assetsCategory);
        if (error) return res.status(400).json({ error });

       

        assetsCategory.createdBy = req.user._id;
        assetsCategory.updatedBy = req.user._id;

        assetsCategory = new AssetsCategoryModel(assetsCategory);
        assetsCategory = await assetsCategory.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: assetsCategory
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}
const getAssetsCategory = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        if(query.updatedBy) query.updatedBy =  ObjectId(query.updatedBy);
        if(query.modelName) query.modelName =  new RegExp(query.modelName,'i');
        delete query.pagination;
        delete query.limit;
            
        let docs = await AssetsCategoryModel.find(query).sort({category: 1}).limit(limit).skip(pagination*limit).populate('state','_id name');;
        const countData = await AssetsCategoryModel.countDocuments(query);
        return res.status(200).send({ result: docs ,countData:countData});
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


const updateAssetsCategory = async (req, res, next) => {
    
    try {
        if (!req.params.id) return res.status(400).json({error: "Assets category id is required"});
        let assetsCategory = req.body;
        const schema = Joi.object({
            state:Joi.string().required(),
            modelName: Joi.string().required(),
            category: Joi.string().required(),
            hp: Joi.string().required(),
            type: Joi.string().required(),
            active: Joi.boolean().required(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

       
        req.body.updatedBy = req.user._id;

        assetsCategory = await AssetsCategoryModel.updateOne({_id: req.params.id}, {$set: req.body});
        if (!assetsCategory) return res.status(400).json({error: "Assets category update failed"});
        
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Assets category updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const removeAssestCategory = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });
        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error }); 

        await AssetsCategoryModel.remove({state: req.params.id,type:"USED"});
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Assets Category Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};
//Bulk import profession
const importAssestsCategory = async (req, res, next) => {
    let assets = await FILE_UPLOAD.uploadMultipleFile(req, true, 'assets');
    //assets.active = true;

    try {
        const schema = Joi.object({
            files: Joi.array(),
            state:Joi.string().required(),
            type:Joi.string().required(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(assets);
        if (error) return res.status(400).json({ error });

        if (!assets.files.length) return res.status(400).json({ error: "Excel File is required" });
        if (assets.files[0].ext != '.xlsx') return res.status(400).json({ error: "Only Excel File format will be processed" });


        let rows = await readXlsxFile(assets.files[0].path).then(r => r);
        if (!rows || !rows.length) console.log(" Excel file upload failed!");

        rows.shift();
        let headers = rows;
        // rows.shift();
        var arrayToInsert = [];
        for (var i = 0; i < rows.length; i++) {
            var oneRow = {
                modelName: headers[i][0],
                category: headers[i][1],
                hp: headers[i][2],
                state: req.body.state,
                type: req.body.type,
                active:true,
                createdBy :req.user._id
            };

            arrayToInsert.push(oneRow);
        }

       
        assets.name = assets.files[0].name;
        delete assets.files;
        let userUpdate = arrayToInsert.map(user => ({
            updateOne: {
              filter: {modelName:user.modelName,type:user.type,state:user.state},
              update: {$set: user},
              upsert: true
            }
          }));

            assets = await AssetsCategoryModel.bulkWrite(userUpdate);
           
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: assets
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}



//Application data Export to Excel
const exportApplicationList = async (req, res, next) => {
    try {
        let query = {};  
        if(req.query.updatedBy) query['updatedBy'] =  ObjectId(req.query.updatedBy);
        if(req.query.startDate && req.query.endDate) query['applicationReceivedDate'] = { $gte:new Date(req.query.startDate).toISOString(),$lte: new Date(req.query.endDate).toISOString()  };
        if(req.query.cibilScore) query['cibilScore'] =  req.query.cibilScore;
        if(req.query.incomeHeading) query['incomeHeading'] =  new RegExp(req.query.incomeHeading,'i');
        if(req.query.finalStatus) query['finalStatus'] =  req.query.finalStatus;
        let userData = req.user.state;
        if(req.user.role.code == 'SUPERVISIOR') query['stateName'] = {$in:userData.map(e => new RegExp(e.name,'i'))};
        if(req.user.role.code == 'UNDER_WRITER') query['createdBy'] = req.user._id;
        

        let docs = await CibilModel.find(query).sort({applicationNumber:1}).populate('cashCrops', 'name').populate('incomeMitigants', 'name');
        // docs = UTILS.cloneObject(docs);
        
    //     let userData = [];
    //     docs.forEach((obj) => {
    //         let cropData = '';
    //         let incomeMitigantsData = '';
    //         obj.cashCrops.map((c, index) =>{
    //            cropData += c.name + ',';
    //         });
    //         obj.incomeMitigants.map((c, index) =>{
    //             incomeMitigantsData += c.name + ',';
    //          });
           
    //     userData.push({
    //     applicationNumber: obj.applicationNumber,
    //     name: obj.name,
    //     email: obj.email,
    //     number: obj.number,
    //     cibilScore: obj.cibilScore,
    //     applicationReceivedDate: moment(obj.applicationReceivedDate).format('DD/MM/YYYY'),
    //     product: obj.product,
    //     loanPurpose: obj.loanPurpose,
    //     loanAmount: obj.loanAmount,
    //     assetModel: obj.assetModel,
    //     ltv: obj.ltv,
    //     loanAppilicatonType: obj.loanAppilicatonType,
    //     branchName: obj.branchName,
    //     stateName: obj.stateName,
    //     areaCategory: obj.areaCategory,
    //     assetCategory: obj.assetCategory,
    //     hp: obj.hp,
    //     age: obj.age,
    //     landHolding: obj.landHolding,
    //     incomeHeading: obj.incomeHeading,
    //     cashCrops: cropData.replace(/,+$/,''),
    //     incomeMitigants: incomeMitigantsData.replace(/,+$/,''),
    //     pastTractorHandlingExperience: obj.pastTractorHandlingExperience,
    //     rtrHeading: obj.rtrHeading,
    //     rtr: obj.rtr,
    //     dealerCategory: obj.dealerCategory,
    //     attachements: obj.attachements,
    //     newTractorHandledBy: obj.newTractorHandledBy,
    //     marginMoney: obj.marginMoney
    //   });

    // });
   
    // let workbook = new excel.Workbook();
    // let worksheet = workbook.addWorksheet("applicationData");
    // worksheet.columns = [
    //   { header: "Application No.", key: "applicationNumber", width: 25 },
    //   { header: "Applicant Name", key: "name", width: 25 },
    //   { header: "Email Address", key: "email", width: 25 },
    //   { header: "Contact Number", key: "number", width: 25 },
    //   { header: "Credit Score", key: "cibilScore", width: 25 },
    //   { header: "Application Received Date", key: "applicationReceivedDate", width: 25 },
    //   { header: "Product", key: "product", width: 25 },
    //   { header: "Loan Purpose Description", key: "loanPurpose", width: 25 },
    //   { header: "Loan Amount Requested", key: "loanAmount", width: 25 },
    //   { header: "Net LTV (%)", key: "ltv", width: 25 },
    //   { header: "Loan Application Type", key: "loanAppilicatonType", width: 25 },
    //   { header: "Asset Model", key: "assetModel", width: 25 },
    //   { header: "Branch Name", key: "branchName", width: 25 },
    //   { header: "State Name", key: "stateName", width: 25 },
    //   { header: "Asset Category", key: "assetCategory", width: 25 },
    //   { header: "HP of asset", key: "hp", width: 25 },
    //   { header: "Age", key: "age", width: 25 },
    //   { header: "Land Holding (in Acres)", key: "landHolding", width: 25 },
    //   { header: "Type of Mitigants", key: "incomeHeading", width: 25 },
    //   { header: "Cash Crops", key: "cashCrops", width: 25 },
    //   { header: "Income Mitigants", key: "incomeMitigants", width: 25 },
    //   { header: "Past Tractor Handling Experience", key: "pastTractorHandlingExperience", width: 25 },
    //   { header: "RTR Heading", key: "rtrheading", width: 25 },
    //   { header: "RTR (in lacs)", key: "rtr", width: 25 },
    //   { header: "Dealer Category", key: "dealerCategory", width: 25 },
    //   { header: "Area Category", key: "areaCategory", width: 25 },
    //   { header: "New Tractor Handled By", key: "newTractorHandledBy", width: 25 },
    //   { header: "Margin Money", key: "marginMoney", width: 25 },
    //   { header: "Attachements", key: "attachements", width: 25 },


    // ];
    // // Add Array Rows
    // worksheet.addRows(userData);
    // //console.log(userData) 
    // res.setHeader(
    //   "Content-Type",
    //   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    // );
    // res.setHeader(
    //   "Content-Disposition",
    //   "attachment; filename=" + "applications.xlsx"
    // );
    // return workbook.xlsx.write(res).then(function () {
    //     res.status(200).end();
    //   });
        return res.status(200).send({ result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

module.exports = {
    create,
    get,
    update,
    remove,
    updateAssetsCategory,
    getAssetsCategory, 
    assetsCategory,
    importAssestsCategory,
    exportApplicationList,
    removeAssestCategory
};