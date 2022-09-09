'use strict';

/**
 * Module dependencies.
*/
const mqtt          = require('mqtt');
const moment        = require('moment');
const client        = mqtt.connect(process.env.MQTT_URL, {
                            clientId: process.env.MQTT_CLIENT_ID+"_"+moment().valueOf()+".0",
                            clean: true
                        });

module.exports = app => {
    client.on('connect', async () => {
        await subscribe(process.env.MQTT_TOPIC);
        app.get('/mqtt/subscribe/:topic', async function(req, res, next) {
            await subscribe(req.params.topic);
            res.send({ status: "Success" });
        });
    
        app.post('/mqtt/publish', async function(req, res) {
            await publish(req.body);
            res.writeHead(204, { 'Connection': 'keep-alive' });
            res.end();
        });
    });

    // client.on('message', function (topic, message) {
    //     console.log(" \n topic : ",topic," >> message : ",message.toString());
    // });
};

function subscribe(topic) {
    client.subscribe(topic);
    return topic;
}

function publish(body) {
    if (body.topic) return {error: "Topic is required"};
    else {
        var message = body;
        message.date = moment().format("YYYY-DD-MM HH:mm:ss");
        message = JSON.stringify(message);

        return new Promise(resolve => {
            var options = {retain: true, qos: 1};
            client.publish(message.topic, message, options, function() {
                resolve({result: "Messsage sent successfully"});
            });
        });
    }
}

module.exports.client = client;
module.exports.publish = publish;
module.exports.subscribe = subscribe;