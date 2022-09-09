'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const FileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String,  enum: ['user'] },
    original: { type: String, required: true },
    path: { type: String, required: true },
    fieldName: { type: String, required: true },
    thumbnail: { type: String, required: false },
    smallFile: { type: String, required: false },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
    description: { type: String, required: false },
    sourceId: { type: String, required: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    active: { type: Boolean, required: false }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('File', FileSchema);