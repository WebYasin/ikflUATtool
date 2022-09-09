'use strict';

const mongoose                  = require('mongoose');
const Schema                    = mongoose.Schema;

const start_from = 1001;

const counterSchema = new Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: start_from }
});

counterSchema.index({ _id: 1, seq: 1 }, { unique: true });

const counterModel = mongoose.model('counter', counterSchema);

const autoIncrementModelID = async function (modelName) {
    let res = await counterModel.findByIdAndUpdate(modelName, {$inc: {seq: 1}}, {new: true, upsert: true});
    if (res.seq < start_from) res = await counterModel.findByIdAndUpdate(modelName, {$set: {seq: start_from}}, {new: true, upsert: true});
    return res.seq;
}

module.exports = autoIncrementModelID;
