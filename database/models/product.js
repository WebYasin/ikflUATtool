'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;
const autoIncrementModelID      = require('./counter');

const FittingInstructionsSchema = new mongoose.Schema({
    _id: false,
    content: { type: String, required: false },
}, { timestamps: true, versionKey: false });

const ApplicationAreasSchema = new mongoose.Schema({
    _id: false,
    name: { type: String, required: false, default: '' },
    files: { type: objectId, ref: 'File' },
}, { timestamps: false, versionKey: false });

const OtherInstructionsSchema = new mongoose.Schema({
    _id: false,
    description: { type: String, required: false, default: '' },
    files: [{ type: objectId, ref: 'File' }],
}, { timestamps: false, versionKey: false });

const SpecificationsSchema = new mongoose.Schema({
    _id: false,
    name: { type: String, required: false, default: '' },
    value: { type: String, required: false, default: '' },
}, { timestamps: false, versionKey: false });

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true },
    color:[{type: String, required: true}],
    slug: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: false },
    files: [{ type: objectId, ref: 'File' }],
    brochure: { type: objectId, ref: 'File' },
    carcass: [{ type: objectId, ref: 'File' }],
    howToOrder: [{ type: objectId, ref: 'File' }],
    category: { type: objectId, ref: 'Category',required: true },
    subCategory: { type: objectId, ref: 'Subcategory' },
    specifications: [SpecificationsSchema],
    applicationArea:[{type: String, required: false,default:''}],
    features:[{type: String, required: false,default:''}],
    fittingInstructions:[{type: String, required: false,default:''}],
    otherInstructions:{ type: String, required: false ,default:''},
    active: { type: Boolean, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Product', ProductSchema);