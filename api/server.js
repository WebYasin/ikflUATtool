'use strict';

const express = require('express');
const app = express();
const cors = require('cors');
const oracledbConn = require('../lib/oracledb');
require('module-alias/register');


app.use(cors());

require('@lib/env');
require('@lib/loggger');

require('@middleware/mqtt')(app);
require('@middleware/express-setup')(app);
require('@middleware/error-handler')(app);
require('@middleware/server')(app);
require('@middleware/router')(app);
// require('@middleware/swagger')(app);
require('../database/migrations/index');

require('./model');

module.exports = app;