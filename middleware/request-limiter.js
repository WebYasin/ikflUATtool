'use strict';

const RateLimit = require('express-rate-limit');

/**
 * Expose
*/

module.exports = app => {
    app.use('trust proxy');
    const apiLimiter = new RateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100
    });
};