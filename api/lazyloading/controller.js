'use strict';

const modelName                 = 'File';
const Joi                       = require('@hapi/joi');
const sharp = require('sharp');
const { FileModel }          = require('@database');
const CONSTANT                  = require('@lib/constant');
const UTILS                     = require('@lib/utils');
const FILE_UPLOAD               = require('@lib/file_upload');

const create = async (req, res, next) => {
    req.body.active = true;
    await sharp('./temp/1644396649214-logo.png').resize(200,200)
.jpeg({quality : 50}).toFile('./temp/1644396649214-logo_thumb.png');
        console.log(preferred);
//const thumbs = await resizer('./1644396649216-no_img.jpg', setup);
    // let file = await FILE_UPLOAD.uploadMultipleFile(req);
    // try {
    //     let result = await new Promise(async (resolve, reject) => {
    //         const schema = Joi.object({
    //             // name: Joi.string(),
    //             // type: Joi.string(),
    //             // original: Joi.string(),
    //             // path: Joi.string(),
    //             // size: Joi.number(),
    //             // mimeType: Joi.string(),
    //             // description: Joi.string(),
    //             active: Joi.boolean()
    //         });
    //         const filesUploaded = file.summaryFiles;
    //         delete req.body.summaryFiles;

    //     const { error } = schema.validate(req.body);
    //     if (error) return reject({ error });
    //     const options = { ordered: true };
    //     const valuesInDb = await FileModel.insertMany(filesUploaded,options);
    //     console.log(`${valuesInDb.insertedCount} documents were inserted`);
    //         return resolve(valuesInDb);
    //     });

    //     return res.status(200).send({
    //         status: CONSTANT.REQUESTED_CODES.SUCCESS,
    //         result: result
    //     });
    // } catch (error) {
    //     return res.status(400).json(UTILS.errorHandler(error));
    // }
}

const get = async (req, res, next) => {
    try {
        let docs = await MatchesModel.find(req.query || {});
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

            let match = await MatchesModel.updateOne({_id: req.params.id}, {$set: req.body});
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

        await MatchesModel.remove({_id: req.params.id});
        return res.status(200).send({ result: "Match deleted successfully" });
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