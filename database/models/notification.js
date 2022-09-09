'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;
const mqtt                      = require('@middleware/mqtt');

const NotificationSchema = new mongoose.Schema({
    type: { type: String, required: true },
    device: { type: Array, required: false },
    message: { type: String, required: false },
    userId: { type: objectId, ref: 'User' },
    data: { type: Object, required: false, default: {} },
    isRead: { type: Boolean, required: true, default: false },
    metadata: { type: Object },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    active: { type: Boolean, required: false }
}, { timestamps: true, versionKey: false });

NotificationSchema.post('save', async (doc) => {
    if (doc.message && doc.userId) {
        const count = await this.model.countDocuments({userId: doc.userId, isRead: false});
        await mqtt.publish({
            topic: process.env.MQTT_TOPIC+'_'+doc.userId.toString(),
            type: 'notification',
            notification: doc.message,
            count: count
        });
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);