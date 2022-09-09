'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const SubcategorySchema = new mongoose.Schema({ 
    category: { type: objectId, ref: 'Category' },
    name : { type: String, required: true },
    files: [{ type: objectId, ref: 'File' }],
    slug: { type: String, required: true, default: "" },
    active: { type: Boolean, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
    createdAt: { type: Number },
    updatedAt: { type: Number }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Subcategory', SubcategorySchema);