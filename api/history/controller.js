'use strict';

const modelName                 = 'History';
const Joi                       = require('@hapi/joi');
const { HistoryModel,
    AssetsCategoryModel }       = require('@database');
const CONSTANT                  = require('@lib/constant'); 
const UTILS                     = require('@lib/utils');
const FILE_UPLOAD               = require('@lib/file_upload');
const oracledb                  = require('@lib/oracledb');
const ObjectId                  = require('mongodb').ObjectId;


const create = async (req, res, next) => {
    let cibil = req.body;
    cibil.active = true;
    cibil.status = false;

    try {
        const schema = Joi.object({
            applicationNumber:Joi.string(),
            name: Joi.string(),
            number: Joi.number(),
            email:Joi.string(),
            applicationReceivedDate:Joi.string(),
            branchName:Joi.string(),
            stateName:Joi.string(),
            product:Joi.string(),
            loanAppilicatonType:Joi.string(),
            assetModel:Joi.string(),
            rtrHeading:Joi.string(),
            loanPurpose:Joi.string(),
            ltv: Joi.string(),
            landHolding: Joi.string(),
            cashCrops: Joi.array(),
            attachements:Joi.string(),
            incomeMitigants: Joi.array(),
            incomeHeading:Joi.string(),
            pastTractorHandlingExperience: Joi.string(),
            rtr: Joi.string(),
            dealerCategory: Joi.string(),
            areaCategory: Joi.string(),
            assetCategory: Joi.string(),
            hpOfAsset: Joi.string(),
            newTractorHandledBy: Joi.string(),
            marginMoney: Joi.string(),
            age: Joi.string(),
            loanAmount: Joi.string(),
            cibilScore: Joi.number(),
            active: Joi.boolean(),
            status: Joi.boolean(),
            finalStatus: Joi.boolean(),
            customFields: Joi.object()
        });
    
        const { error } = schema.validate(cibil);
        if (error) return res.status(400).json({ error });

    

        cibil.createdBy = req.user._id;
        cibil.updatedBy = req.user._id;
 
        cibil = new HistoryModel(cibil);
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
        let query = req.query;
        if(query.updatedBy) query.updatedBy =  ObjectId(query.updatedBy);
        delete query.pagination;
        delete query.limit;

        let docs = await HistoryModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit).populate('createdBy','_id firstName lastName').populate('cashCrops', '_id name').populate('incomeMitigants', '_id name');
        let countData = await HistoryModel.countDocuments(query);
        return res.status(200).send({ result: docs ,countData:countData});
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


module.exports = {
    create,
    get
};