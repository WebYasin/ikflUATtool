'use strict';

const modelName                 = 'Role';
const Joi                       = require('@hapi/joi');
const { RoleModel }         = require('@database');
const CONSTANT                  = require('@lib/constant');
const UTILS                     = require('@lib/utils');

const create = async (req, res, next) => {
    let role = req.body || {};
    role.active = true;

    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            code: Joi.string().required(),
            isAdmin: Joi.boolean(),
            description: Joi.string(),
            privileges: Joi.object(),
            active: Joi.boolean()
        });
    
        const { error } = schema.validate(role);
        if (error) return res.status(400).json({ error });

        role.createdBy = req.user._id;
        role.updatedBy = req.user._id;
        role = new RoleModel(role);
        role = await role.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: role
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const get = async (req, res, next) => {
    try {
        let docs = await RoleModel.find(req.query || {});
        return res.status(200).send({ result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const update = async (req, res, next) => {
    try {
        if (!req.params.id) return res.status(400).json({error: "Role id is required"});

        const schema = Joi.object({
            name: Joi.string(),
            isAdmin: Joi.boolean(),
            description: Joi.string(),
            privileges: Joi.object(),
            active: Joi.boolean()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        req.body.updatedBy = req.user._id;
        let role = await RoleModel.updateOne({_id: req.params.id}, {$set: req.body});
        if (!role) return res.status(400).json({error: "Role update failed"});

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Role updated succesfully"
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

        await RoleModel.remove({_id: req.params.id});
        return res.status(200).send({ result: "Role deleted successfully" });
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