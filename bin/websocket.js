var express = require('express'),
    path = require('path'),
    container = require('../server/container'),
    http = container.get('server.http'),
    app = container.get('app'),
    server = http.start(container.get('app')).server;

module.exports = container.get('websocket.server').start(
    server,
    container.get('websocket.server.adapter')
);
