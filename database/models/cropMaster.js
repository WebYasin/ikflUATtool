'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const CropMasterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    state:{type:objectId,require:true,ref:'State'},
    active: { type: Boolean, default: true },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('CropMaster', CropMasterSchema);