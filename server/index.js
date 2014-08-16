var express = require('express'),
    path = require('path'),
    container = require('./container');

container.share('static', container.protect(express.static(path.join(__dirname, '..', 'client', 'public'))), ['middleware']);

module.exports = container.get('server');
