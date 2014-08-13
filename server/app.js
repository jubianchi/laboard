var express = require('express'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    application = module.exports = express();

require('./service/config')(application);

application
    .use(cookieParser())
    .use(bodyParser())
    .use(function(req, res, next) {
        if (req.cookies.access_token) {
            req.body.access_token = req.cookies.access_token;
        }

        next();
    });

application.socket = function(srv) {
    application.io = require('socket.io')(srv);

    application.io.sockets.on('connection', function (socket) {
        socket.emit('message', { message: 'welcome to the chat' });

        socket.on('send', function (data) {
            application.io.sockets.emit('message', data);
        });
    });
};

require('./service/logger')(application);
require('./service/auth')(application);
require('./service/router')(application);
require('./service/gitlab')(application);
