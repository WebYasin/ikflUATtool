'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;
const autoIncrementModelID      = require('./counter');
const moment                    = require('moment');

const CibilSchema = new mongoose.Schema({ 
    name: { type: String, required: true },
    email: { type: String, required: false },
    number: { type: String, required: false },
    applicationReceivedDate:{type: String, required: true},
    branchName:{type: String, required: true},
    product:{type: String, required: true},
    loanPurpose:{type: String, required: true},
    loanAppilicatonType:{type: String, required: true},
    assetModel:{type: String, required: true},
    stateName:{type: String, required: true},
    rtrHeading:{type: String, required: true},
    ltv: { type: String, required: true},
    landHolding: { type: String, required: true},
    incomeHeading: { type: String, required: true},
    cashCrops: [{ type: objectId, required: false,ref:'CropMaster'}],
    incomeMitigants: [{ type: objectId, required: false,ref:'IncomeMitigants'}],
    pastTractorHandlingExperience: { type: String, required: true},
    rtr: { type: String, required: true},
    dealerCategory: { type: String, required: true},
    areaCategory: { type: String, required: true},
    assetCategory: { type: String, required: true},
    hpOfAsset: { type: String, required: true},
    newTractorHandledBy: { type: String, required: true},
    marginMoney: { type: String, required: true},
    age: { type: String, required: true},
    loanAmount: { type: String, required: true},
    applicationNumber: { type: String, required: false,default:''},
    cibilScore: { type: Number, required: true},
    active: { type: Boolean, default: false },
    status: { type: Boolean, default: false },
    finalStatus: { type: Boolean, default: false },
    attachements: { type: String, required: true},
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });


module.exports = mongoose.model('Cibil', CibilSchema);