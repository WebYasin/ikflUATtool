'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const AssetscategorySchema = new mongoose.Schema({
    state: { type: objectId, required: true,ref: 'State' },
    modelName: { type: String, required: true },
    category: { type: String, required: true },
    hp: { type: String, required: true },
    type: { type: String, required: true, enum: ['USED','NEW'] },
    active: { type: Boolean, default: true },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Assetscategory', AssetscategorySchema);