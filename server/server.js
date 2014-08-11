var express = require('express'),
    path = require('path'),
    colors = require('colors'),
    app = require('./app');

app.logger.info('running');

app.use(express.static(path.join(__dirname, '..', 'client', 'public')));

var server = app.listen(app.config.port, function() {
    app.logger.info('Listening on port %d', server.address().port);
});

app.socket(server);
