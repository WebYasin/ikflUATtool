'use strict';

/**
 * Module dependencies.
*/

const bodyParser        = require('body-parser');
const methodOverride    = require('method-override');
const cors              = require('cors');
const helmet            = require('helmet');
const env               = process.env.NODE_ENV || 'development';
const hpp               = require('hpp');

/**
 * Expose
*/

module.exports = app => {
    app.use(helmet());
    app.disable('x-powered-by');
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    app.use(hpp()); // They are safe from HTTP Parameter Pollution now.
    app.use(cors({ origin: ['http://localhost:5050'] }));

    app.set('view engine', 'pug');

    app.use(bodyParser.json({ limit: '50mb' }));

    app.use(
        methodOverride(req => {
            if (req.body && typeof req.body === 'object' && '_method' in req.body) {
                let method = req.body._method;
                delete req.body._method;
                return method;
            }
        })
    );

    app.all('*', function (req, res, next) {
        req.respBody = {};
        next();
    });

    if (env === 'development') {
        app.locals.pretty = true;
    }
};
