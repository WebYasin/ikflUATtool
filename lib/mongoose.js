'use strict';

const mongoose = require('mongoose');

module.exports = {
    connect: () => {
        try {
            let connectionString = `mongodb://`;
            if (process.env.DB_USER) connectionString += `${process.env.DB_USER}:${process.env.DB_PASSWORD}@`;
            connectionString += `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
            if (process.env.DB_USER) connectionString += `?authSource=${process.env.DB_AUTH}`;
            const options = {keepAlive: 1, useNewUrlParser: true, useUnifiedTopology: true};
            const uri = process.env.MONGODB_URL || connectionString;
            mongoose.set('useNewUrlParser', true);
            mongoose.set('useFindAndModify', false);
            mongoose.set('useCreateIndex', true);
            mongoose.connect(uri, options).catch(err => {
                logger.error(err, 'Mongo Connection Error : ', err);
            });
            return mongoose;
        } catch (e) {
            return logger.error('Mongo Connection Error : ', e);
        }
    }
};
