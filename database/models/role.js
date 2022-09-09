'use strict';

const mongoose                  = require('mongoose');
const uniqueValidator           = require('mongoose-unique-validator');

const RoleShema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, index: true, enum: ['SUPER_ADMIN', 'UNDER_WRITER', 'SUPERVISIOR', 'REPORTER'] },
    isAdmin: { type: Boolean, required: false, default: false },
    description: { type: String, required: false, default: "" },
    privileges: { type: Object, required: false },
    active: { type: Boolean, required: false }
}, { timestamps: true, versionKey: false });

RoleShema.plugin(uniqueValidator, { message: 'Duplicate Entry {PATH}' });

RoleShema.pre('save', async function (next) { next(); });

module.exports = mongoose.model('Role', RoleShema);