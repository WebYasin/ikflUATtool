var admin = require("firebase-admin");
var serviceAccount = require("../lib/google-services.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://xxxxx.firebaseio.com"   // DB URL
  });
  
const messaging = admin.messaging()

module.exports = {
	notificationCallback: (error, response, body) => {
        if (error) { console.error(error); } else if (response.statusCode >= 400) {
            console.error('HTTP Error: ' + response.statusCode + ' - ' + response.statusMessage);
        } else {
            console.log('Notification sent successfully.', body);
        }
	},
    extractDeviceTokenValue: (device_tokens, device_type) => {
		var i;
        var device_token_tmp = {};
        device_token_tmp['android'] = [];
        device_token_tmp['ios'] = [];
            for (i in device_tokens) {
                if (device_tokens[i]['type'] == "ANDROID") {
                    if(device_tokens[i]['deviceToken'] != ""){
                        device_token_tmp['android'].push(device_tokens[i]['uuid']);
                    }
                }else{
                    if (device_tokens[i]['type'] == "IOS") {
                        if(device_tokens[i]['deviceToken'] != ""){
                            device_token_tmp['ios'].push(device_tokens[i]['uuid']);
                        }
                    }
                }
            }
        return device_token_tmp;
	},

    sendNotificationToAndroidUsers: (device_tokens, payloads, callback) => {
        console.log(device_tokens)
        let notification = {};
        var payload = {
            notification : notification,
            data: payloads,
            token: device_tokens.toString()
        };
        console.log("android payload", JSON.stringify(payload));
        messaging.send(payload)
            .then((result) => {
                if(result){
                    console.log("message result", result)
                    callback(result);
                }else{
                    callback(0);
                }
                
            }).catch(function (err) {
                console.log("message error", err)
                callback(0)
            })
    },
    sendNotificationToIosUsers :  (device_tokens, payloads, callback) => {
    device_tokens = "740f4707bebcf74f9b7c25d48e3358945f6aa01da5ddb387462c7eaf61bb78ad";
    console.log("device_tokens", device_tokens);
    let notification = {};
    var payload = {
        notification : notification,
        data: payloads,
        token: device_tokens.toString()
    };
    messaging.send(payload)
        .then((result) => {
            if(result){
                console.log("result", result)
                callback(result);
            }else{
                console.log("result", result)
                callback(0);
            }
            
        }).catch(function (err) {
            console.log("err", err)
            callback(err)
        })
}
}