'use strict';

const mongoose                  = require('mongoose');
const uniqueValidator           = require('mongoose-unique-validator');
const bcrypt                    = require('bcrypt');
const objectId                  = mongoose.Schema.Types.ObjectId;




const UserSchema = new mongoose.Schema({
    email: { type: String, required: true },
    phoneNumber: { type: Number, required: true },
    password: { type: String, required: true },
    role: { type: objectId, ref: 'Role' },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: true },
    designation: { type: String, required: true },
    file: { type: objectId, ref: 'File' },
    active: { type: Boolean, default: true }, 
    firstLogin: { type: Boolean, default: true },
    online: { type: Boolean, default: true },
    state: [{ type: objectId, ref: 'State',required: true }],
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} }
}, { timestamps: true, versionKey: false });

UserSchema.plugin(uniqueValidator, { message: "Duplicate Entry {PATH}" });

UserSchema.pre('save', async function (next) {
    if (this.password) {
        const salt = await bcrypt.genSalt(parseInt(process.env.HASH_COST));
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

UserSchema.methods.isValidPassword = async function (password) {
    const doc = await this.model('User').findOne({ _id: this._id }, 'password');
    return await bcrypt.compare(password, doc.password);
};

module.exports = mongoose.model('User', UserSchema);