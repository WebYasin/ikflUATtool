'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const LogsSchema = new mongoose.Schema({
    type: { type: String, required: true, enum: ["USER", "NOTIFICATION", "SESSION"] },
    device: { type: String, required: false },
    userId: { type: objectId, required: true },
    duration: { type: Number, required: false },
    data: { type: Object, required: false, default: "" },
    active: { type: Boolean, required: false }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Logs', LogsSchema);