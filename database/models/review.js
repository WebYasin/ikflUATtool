'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const CommentSchema = new mongoose.Schema({
    comment: { type: String, required: true },
    commentedBy: { type: objectId, ref: 'User' },
    approvedBy: { type: objectId, ref: 'User' },
    status: { type: String, default:'NOT_APPROVED', enum: ['NOT_APPROVED', 'APPROVED', 'DECLINED'] }
}, { timestamps: true, versionKey: false });

const ReviewSchema = new mongoose.Schema({
    order: { type: objectId, ref: 'Order' },
    product: { type: objectId, ref: 'Product' },
    service: { type: objectId, ref: 'Service' },
    rating: { type: Number, required: true },
    feedback: { type: String, required: false, default: '' },
    comments: [CommentSchema],
    files: [{ type: objectId, ref: 'File' }],
    approvedBy: { type: objectId, ref: 'User' },
    status: { type: String, default: 'NOT_APPROVED', enum: ['NOT_APPROVED', 'APPROVED', 'DECLINED'] },
    type: { type: String, default: 'PRODUCT', enum: ['SERVICE', 'PRODUCT'] },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Review', ReviewSchema);