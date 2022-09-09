'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const BlogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: false, default: "" },
    shortDescription: { type: String, required: true },
    description: { type: String,required: false, default: "" },
    eventDate: { type: String ,required: false, default: ""},
    files: [{ type: objectId, ref: 'File' }],
    thumbnail: [{ type: objectId, ref: 'File' }],
    metaTag: { type: String,required: false, default: "" },
    metaTitle: { type: String,required: false, default: "" },
    metaDescription: { type: String,required: false, default: "" },
    active: { type: Boolean, default: true },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Blog', BlogSchema);