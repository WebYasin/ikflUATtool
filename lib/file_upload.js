'use strict';

//Replace with Express-captcha

const multer                    = require('multer');
const path                      = require('path');
const AWS                       = require('aws-sdk');
const sharp                     = require('sharp');
const fse                       = require('fs-extra');
const fs                        = require('fs');
const { FileModel }             = require('@database');
const UTILS                     = require('./utils');

if (fse.existsSync('./temp') === false) fse.mkdir('./temp');
if (fse.existsSync('./temp/thumbnail') === false) fse.mkdir('./temp/thumbnail');
if (fse.existsSync('./temp/small') === false) fse.mkdir('./temp/small');

const s3 = new AWS.S3({
    bucketName: process.env.BUCKET_NAME,
    dirName: process.env.DIR_NAME,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    accessKeyId: process.env.ACCESS_KEY_ID,
});

AWS.config.update({region: process.env.S3_REGION})

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './temp');
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + '-' + file.originalname);
    }
});

const uploadMultiple = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        callback(null, true);
    },
    limits: {
        fileSize: 100 * 1024 * 1024
    }
}).fields(
    [
        {name: 'file', maxCount: 10},
        {name: 'blog', maxCount: 10},
        {name: 'coverPhoto', maxCount: 10},
        {name: 'carcass', maxCount: 10}
    ]
);

async function uploadMultipleFile(req, local=false, type='user') {
    try {
        return new Promise(resolve => {
            uploadMultiple(req, {}, async (error) => {
                if (error) {
                    logger.error(error);
                    return resolve({ error });
                }

                const body = req.body;
                body.files = [];
                if (req.files && Object.keys(req.files).length) {
                    let files = [];
                    Object.keys(req.files).forEach(key => {
                        files = [...files, ...req.files[key]];
                    });
                    for (let fileRec of files) {
                        let json_file = UTILS.cloneObject(fileRec);
                        let name = path.parse(json_file.filename).name;
                        let ext = path.parse(json_file.filename).ext;
                        let fileRecord = {
                            name: json_file.filename,
                            type: type,
                            original: json_file.originalname,
                            fieldName: json_file.fieldname,
                            path: json_file.path,
                            size: json_file.size,
                            mimeType: json_file.mimetype,
                            sourceId: (req.user || {})._id || "",
                            createdBy: (req.user || {})._id || "",
                            updatedBy:(req.user || {})._id || ""
                        }
                        
                        if (!local) {
                            let fileTypes = ['original', 'thumbnail', 'small'].map(async fileType => {
                                if (json_file.mimetype.search(/image/i) > -1 || fileType == 'original') {
                                    let path = './temp/';
                                    if (fileType != 'original') {
                                        path += `${fileType}/${name}${ext}`;
                                        await uploadImageExtensionCustom(
                                            fileType == 'small' ? 150 : 400,
                                            fileType == 'small' ? 150 : 400,
                                            `./temp/${name}${ext}`,
                                            path,
                                            100);
                                    } else path += `${name}${ext}`;
            
                                    let s3File = await uploadToS3({
                                        path: path,
                                        filename: `${fileType != 'original' ? fileType+'_' : ''}${name}${ext}`
                                    });
                                    fileRecord[fileType == 'original' ? 'path': fileType == 'thumbnail' ? 'thumbnail' : 'smallFile'] = s3File.Location;
                                    return s3File;
                                } else return null;
                            });

                            await Promise.all(fileTypes);
                            fileRecord = await saveFile(fileRecord);
                        }
                        
                        fileRecord.ext = ext;
                        body.files.push(fileRecord);
                    };
                }

                resolve(body);
            });
        });
    } catch (error) {
        logger.error('file error', error);
        return { error };
    }
}

async function uploadImageExtensionCustom(
    length,
    height,
    fromImagePath,
    toImagePath,
    quality
) {
    return await sharp(fromImagePath)
      .resize(length, height)
      .jpeg({ quality: quality })
      .toFile(toImagePath);
}

function deleteFile(fileName, bucketName) {
    if (!fileName) return {error: "File name is required"};
    let bucketNameDetails = bucketName || process.env.BUCKET_NAME || 'women-listed-workspace';

    AWS.config.update({
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
        accessKeyId: process.env.ACCESS_KEY_ID,
    });

    var s3Buck = new AWS.S3();
    s3Buck.deleteObject({Bucket: bucketNameDetails, Key: fileName}, function (error, res) {
        if (error) {
            logger.error(error);
            return {message: "error while delete the s3 objects", error: error};
        } else {
            return {status: "SUCCESS", message: "Deleted successfully"};
        }
    });
}

async function uploadToS3(file) {
    try {
        return new Promise((resolve, reject) => {
            fs.readFile(file.path, (error, data) => {
                if (error) reject({ error });

                const params = {
                    Bucket: process.env.BUCKET_NAME + '/' + process.env.DIR_NAME,
                    Key: `${file.filename}`,
                    Body: data
                };
                s3.upload(params, (error, data) => {
                    if (error) reject({ error });
                    else {
                        file.originalname = file.filename;
                        fs.unlink(file.path, function (error) {
                            if (error) reject({ error });
                        });
                        resolve(data);
                    }
                });
            });
        });
    } catch (error) {
        fs.unlink(file.path, function (error) {
            if (error) {
                logger.log("error ",error);
                return { error };
            }
        });
        logger.log("error ",error);
        return { error };
    }
}

async function saveFile(file) {
    try {
        file.active = true;
        file = new FileModel(file);
        file = await file.save();
        file = UTILS.cloneObject(file);

        return file;
    } catch (error) {
        logger.error('file error', error);
        return { error };
    }
}

module.exports.uploadMultipleFile = uploadMultipleFile;
module.exports.deleteFile = deleteFile;
module.exports.uploadImageExtensionCustom = uploadImageExtensionCustom;