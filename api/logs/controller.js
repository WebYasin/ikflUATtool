'use strict';

const modelName                  = 'Logs';
const Joi                        = require('@hapi/joi');
const { LogsModel }              = require('@database');
const CONSTANT                   = require('@lib/constant');
const UTILS                      = require('@lib/utils');

const create = async (req, res, next) => {
    let log = req.body || {};
    log.active = true;

    try {
        let result = await new Promise(async (resolve, reject) => {
            const schema = Joi.object({
                type: Joi.string().required(),
                device: Joi.string(),
                userId: Joi.string().required(),
                duration: Joi.string(),
                data: Joi.object(),
                active: Joi.boolean()
            });
        
            const { error } = schema.validate(log);
            if (error) return reject({ error });

            log = new LogsModel(log);
            log = await log.save();
            return resolve(log);
        });

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: result
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const get = async (req, res, next) => {
    try {
        let docs = await LogsModel.find(req.query || {});
        return res.status(200).send({ result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const update = async (req, res, next) => {
    try {
        await new Promise(async (resolve, reject) => {
            if (!req.params.id) return reject({error: "Log id is required"});

            const schema = Joi.object({
                type: Joi.string(),
                device: Joi.string(),
                userId: Joi.string(),
                duration: Joi.string(),
                data: Joi.object(),
                active: Joi.boolean()
            });

            const { error } = schema.validate(req.body);
            if (error) return reject({ error });

            let logs = await LogsModel.updateOne({_id: req.params.id}, {$set: req.body});
            if (!logs) return reject({error: "Logs update failed"});

            resolve(logs);
        });

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Logs updated succesfully"
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

        await LogsModel.remove({_id: req.params.id});
        return res.status(200).send({ result: "Logs deleted successfully" });
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