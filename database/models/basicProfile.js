'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const LocationSchema = new mongoose.Schema({
    _id : false,
    floor: { type: String, required: false, default: "" },
    street: { type: String, required: false, default: "" },
    landmark: { type: String, required: false, default: "" },
    state: { type: String, required: false, default: "" },
    city: { type: String, required: false, default: "" },
    pinCode: { type: Number, required: false },
}, { timestamps: true, versionKey: false });

const BankSchema = new mongoose.Schema({
    _id : false,
    accountNumber: { type: String, required: false, default: "" },
    confirmAccountNumber: { type: String, required: false, default: "" },
    ifscCode: { type: String, required: false, default: "" },
}, { timestamps: true, versionKey: false });

const BasicProfileSchema = new mongoose.Schema({
    businessName: { type: String, required: true },
    gstin: { type: String },
    address: LocationSchema,
    bankDetails: BankSchema,
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('BasicProfile', BasicProfileSchema);