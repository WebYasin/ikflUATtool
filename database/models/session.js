'use strict';

const mongoose                  = require('mongoose');
const uniqueValidator           = require('mongoose-unique-validator');
const objectId                  = mongoose.Schema.Types.ObjectId;

const SessionSchema = new mongoose.Schema({
    userId: { type: objectId, required: true, ref: "User" },
    token: { type: String, required: true },
    logout: { type: Boolean, required: true, default: false }
}, { timestamps: true, versionKey: false });

SessionSchema.plugin(uniqueValidator, { message: 'Duplicate Entry {PATH}' });

SessionSchema.pre('save', async function (next) { next(); });

module.exports = mongoose.model('Session', SessionSchema);