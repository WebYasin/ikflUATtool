'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const FaqSchema = new mongoose.Schema({
    heading: { type: String, required: true },
    description: { type: String, required: true },
    active: { type: Boolean, default: true },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Faq', FaqSchema);