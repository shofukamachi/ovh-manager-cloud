/**
 * Main application file
 */

"use strict";

const spdy = require('spdy');
const fs = require('fs');
const options = {
    key: fs.readFileSync(__dirname + '/certificate/server.key'),
    cert:  fs.readFileSync(__dirname + '/certificate/server.crt')
};

var express = require("express");
var config = require("./config/environment");

// Setup server
var app = express();
var server = spdy.createServer(options, app);
app = require("../build/dev-server").injectWebpackMiddleware(app);
require("./config/express").default(app);
require("./routes").default(app);

// Start server
server.listen(config.port, config.ip, function (error) {
    if (error) {
        console.log(error);
        return process.exit(1);
    } else {
        console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
    }
});

// Expose app
exports = module.exports = app;
