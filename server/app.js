var express = require('express'),
    _ = require('underscore'),
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

require('./service/logger')(application);
require('./service/auth')(application);
require('./service/router')(application);
require('./service/gitlab')(application);
