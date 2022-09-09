'use strict';

//Replace with Express-captcha

const svgCaptcha = require('svg-captcha');

const  captcha = svgCaptcha.create();


module.exports = app => {
    app.get('/re-captcha',  (req, res, next) => {
        try {
            let captcha = svgCaptcha.create();
            req.session.captcha = captcha.text;
            res.type('svg');
            res.status(200).send(captcha.data);
        } catch (err) {
            logger.error('re-captcha error:',err);
            next(err);
        }

    });
};
