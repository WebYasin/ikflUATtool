'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;
const autoIncrementModelID      = require('./counter');
const moment                    = require('moment');

const HistorySchema = new mongoose.Schema({ 
    name: { type: String, required: false},
    email: { type: String, required: false },
    number: { type: String, required: false },
    applicationReceivedDate:{type: String, required: false},
    branchName:{type: String, required: false},
    product:{type: String, required: false},
    loanPurpose:{type: String, required: false},
    loanAppilicatonType:{type: String, required: false},
    assetModel:{type: String, required: false},
    stateName:{type: String, required: false},
    rtrHeading:{type: String, required: false},
    ltv: { type: String, required: false},
    landHolding: { type: String, required: false},
    incomeHeading: { type: String, required: false},
    cashCrops: [{ type: objectId, required: false,ref:'CropMaster'}],
    incomeMitigants: [{ type: objectId, required: false,ref:'IncomeMitigants'}],
    pastTractorHandlingExperience: { type: String, required: false},
    rtr: { type: String, required: false},
    dealerCategory: { type: String, required: false},
    areaCategory: { type: String, required: false},
    assetCategory: { type: String, required: false},
    hpOfAsset: { type: String, required: false},
    newTractorHandledBy: { type: String, required: false},
    marginMoney: { type: String, required: false},
    age: { type: String, required: false},
    loanAmount: { type: String, required: false},
    applicationNumber: { type: String, required: false,default:''},
    cibilScore: { type: Number, required: false},
    active: { type: Boolean, default: false },
    status: { type: Boolean, default: false },
    finalStatus: { type: Boolean, default: false },
    attachements: { type: String, required: false},
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });


module.exports = mongoose.model('History', HistorySchema);