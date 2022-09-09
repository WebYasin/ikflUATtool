'use strict';

const env = process.env.NODE_ENV || 'development';
const fs = require('fs');
const dotenv = require('dotenv');
const result = dotenv.config();

if (result.error) {
    throw new Error("Couldn't find .env file!");
} else if (env != 'development') {
    let envConfig = dotenv.parse(fs.readFileSync('.env.'+env));

    if (envConfig.error) {
        throw new Error("Couldn't find .env file!");
    } else {
        for (let k in envConfig) {
            process.env[k] = envConfig[k];
        }
    }
}