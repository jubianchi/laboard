var express = require('express'),
    path = require('path'),
    container = require('../server/container'),
    app = express();

app.use(express.static(path.join(__dirname, '..', 'client', 'public')));

module.exports = container.get('server.http').start(app);
