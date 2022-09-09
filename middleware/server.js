"use strict";

const mongoose = require("@lib/mongoose").connect();
const http = require("http");

module.exports = (app) => {
    mongoose.connection.on("connected", listen);
    mongoose.connection.on("error", dbError).on("disconnected", mongoose.connect);

    async function listen() {
        app.set("port", process.env.PORT);
        http.createServer(app).listen(process.env.PORT);
        console.log("App server started on port : " + process.env.PORT);
    }
    
    function dbError(err) {
        logger.error("Mongo connection error : ", err);
    }
}