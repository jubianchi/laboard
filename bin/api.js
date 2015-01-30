var express = require('express'),
    path = require('path'),
    container = require('../server/container'),
    app = container.get('app');

container.get('auth').setup(app);
container.get('router').setup(app);

module.exports = container.get('server.http').start(app);
