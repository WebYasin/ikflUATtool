'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const CategorySchema = new mongoose.Schema({ 
    orderId: { type: String, required: true },
    transactionId: { type: String, required: true },
    modeOfPayment: { type: String, required: true },
    amount: { type: Number, required: true},
    paymentStatus: { type: String, required: false},
    createdBy: { type: objectId, ref: 'User' }, 
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
},  { timestamps: true, versionKey: false });

module.exports = mongoose.model('Category', CategorySchema);