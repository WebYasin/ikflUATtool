'use strict';

const modelName                 = 'File';
const Joi                       = require('@hapi/joi');
const { FileModel }             = require('@database');
const CONSTANT                  = require('@lib/constant');
const UTILS                     = require('@lib/utils');

const create = async (req, res, next) => {
    let file = req.file;
    file.active = true;
    
    try {
        const schema = Joi.object({
            name: Joi.string(),
            type: Joi.string(),
            original: Joi.string(),
            path: Joi.string(),
            size: Joi.number(),
            mimeType: Joi.string(),
            description: Joi.string(),
            active: Joi.boolean()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send({ error });

        file = new FileModel(file);
        file = await file.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: file
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
        delete query.pagination;
        delete query.limit;

        let docs = await FileModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit);
        return res.status(200).send({ result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const update = async (req, res, next) => {
    try {
        await new Promise(async (resolve, reject) => {
            if (!req.params.id) return reject({error: "Match id is required"});

            const schema = Joi.object({
                userId: Joi.array(),
                active: Joi.boolean()
            });

            const { error } = schema.validate(req.body);
            if (error) return reject({ error });

            let match = await FileModel.updateOne({_id: req.params.id}, {$set: req.body});
            if (!match) return reject({error: "Match update failed"});

            resolve(match);
        });

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Match updated succesfully"
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

        await FileModel.deleteOne({_id: req.params.id});
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Match deleted successfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

module.exports = {
    create,
    get,
    update,
    remove
};