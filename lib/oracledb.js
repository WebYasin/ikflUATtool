'use strict';

const oracledb = require('oracledb');
const config = {
    user: 'credits',
    password: 'mIjHf#4(86',
    connectString: 'ifcrepdb.csqzxv4yfgps.ap-south-1.rds.amazonaws.com:1526/ifcrepdb'
  }
module.exports = {
    connect: async () => {
        let connection;
        try {
            connection = await oracledb.getConnection(config);
                  return connection?connection:false;
        } catch (e) {
            return logger.error('Oracle Connection Error : ', e);
        }
    }
};