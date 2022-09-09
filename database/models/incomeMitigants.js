'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const IncomeMitigantsSchema = new mongoose.Schema({
    name: { type: String, required: true },
    active: { type: Boolean, default: true },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('IncomeMitigants', IncomeMitigantsSchema);