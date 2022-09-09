'use strict';

const mongoose                  = require('mongoose');

const StateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    shortCode: { type: String, required: true }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('State', StateSchema);