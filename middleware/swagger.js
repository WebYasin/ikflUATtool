const swaggerUi         = require('swagger-ui-express');
const swaggerDocument   = require('../docs/swagger/swagger.json');

module.exports = (app) => {
    app.use('/api-docs', (req, res, next) => {
        swaggerDocument.host = process.env.NODE_ENV === 'production' ? req.headers.host : process.env.HOST;
        req.swaggerDoc = swaggerDocument;
        next();
    }, swaggerUi.serve, swaggerUi.setup());
};