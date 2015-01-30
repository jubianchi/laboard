var express = require('express'),
    path = require('path'),
    container = require('../server/container');

container.get('app').use(container.get('static'));

module.exports = container.get('server');
