'use strict';

const mongoose                  = require('mongoose');
const uniqueValidator           = require('mongoose-unique-validator');
const objectId                  = mongoose.Schema.Types.ObjectId;

const OtpShema = new mongoose.Schema({
    type: { type: String, required: true, enum: ['OTP'] },
    token: { type: String, required: true },
    userId: { type: objectId, ref: 'User' },
    email: { type: String, required: true },
    expiry: { type: Number, required: true },
    active: { type: Boolean, required: false }
}, { timestamps: true, versionKey: false });

OtpShema.plugin(uniqueValidator, { message: 'Duplicate Entry {PATH}' });

module.exports = mongoose.model('Otp', OtpShema);