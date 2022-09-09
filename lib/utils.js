const CONSTANT              = require('@lib/constant');
const crypto                = require('crypto');

module.exports = {
	cloneObject: (object) => {
		return JSON.parse(JSON.stringify(object));
	},
	encryptText: (text) => {
		return crypto.createHash('md5').update(text+'').digest("hex");
	},
	getRandomNumber: () => {
		return Math.floor(100000 + Math.random() * 900000);
    },
    generatePassword: () => {
        var length = 8,
            charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            retVal = "";
        for (var i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        return retVal;
    },
    errorHandler: (error) => {
        logger.error(error);
        if (error.error) {
            error = error.error;
        } else if (!error.message && !error.stack) {
            error = error.error || {};
            const { details } = error;
            error = { message: (details || []).map(i => i.message).join(',') };
        } else {
            error = { message: error.message, stack: error.stack };
        }
        logger.log("error", error);
        
        return {
            status: CONSTANT.REQUESTED_CODES.ERROR,
            error: error
        };
    }
}
