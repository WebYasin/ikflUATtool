'use strict';

const mongoose                 = require('mongoose');
const objectId                 = mongoose.Schema.Types.ObjectId;

const ForgotPasswordSchema = new mongoose.Schema({
    userId: { type: objectId, required: true, ref: 'User' },
    consumed: { type: Boolean, required: true },
    token: { type: String, required: true }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('forgotPassword', ForgotPasswordSchema);