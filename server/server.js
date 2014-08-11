var express = require('express'),
    path = require('path'),
    cluster = require('cluster'),
    colors = require('colors'),
    app = require('./app');

if(cluster.isMaster) {
    var cpuCount = require('os').cpus().length;

    app.logger.setPrefix('Master'.yellow);
    app.logger.info('Forking ' + cpuCount + ' workers');

    for(var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    cluster.on('exit', function (worker) {
        app.logger.warn('Worker ' + worker.id + ' died');
        cluster.fork();
    });
} else {
    app.logger.setPrefix(('Worker ' + cluster.worker.id).yellow);
    app.logger.info('running');

    app.use(express.static(path.join(__dirname, '..', 'client', 'public')));

    var server = app.listen(app.config.port, function() {
        app.logger.info('Listening on port %d', server.address().port);
    });

    app.socket(server);
}
