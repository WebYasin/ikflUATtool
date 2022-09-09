'use strict';

const modelName                 = 'Session';
const Joi                       = require('@hapi/joi');
const { SessionModel }          = require('@database');
const CONSTANT                  = require('@lib/constant');
const UTILS                     = require('@lib/utils');

const create = async (req, res, next) => {
    let session = req.body || {};
    session.logout = true;

    try {
        const schema = Joi.object({
            userId: Joi.string().required(),
            token: Joi.string().required(),
            logout: Joi.boolean().required()
        });
    
        const { error } = schema.validate(session);
        if (error) return res.status(400).json({ error });

        session.createdBy = req.user._id;
        session.updatedBy = req.user._id;
        session = new SessionModel(session);
        session = await session.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: session
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const get = async (req, res, next) => {
    try {
        let docs = await SessionModel.find(req.query || {});
        return res.status(200).send({ result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const update = async (req, res, next) => {
    try {
        if (!req.params.id) return res.status(400).json({error: "Session id is required"});

        const schema = Joi.object({
            userId: Joi.string(),
            token: Joi.string(),
            logout: Joi.boolean()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        req.body.updatedBy = req.user._id;
        let session = await SessionModel.updateOne({_id: req.params.id}, {$set: req.body});
        if (!session) return res.status(400).json({error: "Session update failed"});

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Session updated succesfully"
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

        await SessionModel.remove({_id: req.params.id});
        return res.status(200).send({ result: "Session deleted successfully" });
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