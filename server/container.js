var Jimple = require("./lib/jimple"),
    fs = require('fs'),
    path = require('path'),
    express = require('express'),
    jimple = module.exports = new Jimple();

jimple
    .share('config', function() {
        var config = require('../config/server.json');

        if (fs.existsSync(config.data_dir) === false) {
            fs.mkdirSync(config.data_dir);
        }

        return config;
    })
    .share('logger', function() {
        var winston = require('winston'),
            Logger = winston.Logger,
            Console = winston.transports.Console;

        return new Logger({
            transports: [new Console()]
        });
    })
    .share('auth', function(container) {
        var Auth = require('./lib/auth');

        return new Auth(container.get('config').gitlab_url, container.get('gitlab'));
    })
    .share('router', function(container) {
        var Router = require('./lib/router'),
            router = new Router(container.get('auth').authenticate, container.get('logger'));

        container.getTagged('controller').forEach(function(name) {
            container.get('logger').info('Loading controller %s', name);

            container.get(name)(router, container);
        });

        return router;
    })
    .share('server.websocket', function(container) {
        var Websocket = require('./lib/server/websocket');

        return new Websocket(container.get('gitlab'), container.get('gitlab.projects'), container.get('logger'));
    })
    .share('server.http', function(container) {
        var Server = require('./lib/server/http');

        return new Server(container.get('config').port, container.get('logger'));
    })
    .share('gitlab', function(container) {
        var Gitlab = require('./lib/gitlab');

        return new Gitlab(container.get('config').gitlab_url + '/api/v3', container.get('http.client'));
    })
    .share('gitlab.formatter', function() {
        return require('./lib/gitlab/formatter');
    })
    .share('gitlab.projects', function(container) {
        var Projects = require('./lib/gitlab/projects');

        return new Projects(container.get('gitlab'), container.get('gitlab.formatter'));
    })
    .share('gitlab.issues', function(container) {
        var Issues = require('./lib/gitlab/issues');

        return new Issues(
            container.get('gitlab'),
            container.get('gitlab.projects'),
            container.get('gitlab.formatter'),
            container.get('config').gitlab_version
        );
    })
    .share('mysql', function(container) {
        var mysql = require('mysql');

        return mysql.createConnection(container.get('config').mysql);
    })
    .share('app', function(container) {
        var application = express();

        container.getTagged('middleware').forEach(function(name) {
            container.get('logger').info('Loading middleware %s', name);

            application.use(container.get(name));
        });

        container.get('auth').setup(application);
        container.get('router').setup(application);

        return application;
    })
    .share('server', function(container) {
        var http = container.get('server.http'),
            server = http.start(container.get('app')).server;

        container.get('server.websocket').start(server);

        return http;
    })
    .share('socket', function(container) {
        return container.get('server.websocket').websocket;
    })
    .share('controller.auth', jimple.protect(require('./controller/auth')), ['controller'])
    .share('controller.board', jimple.protect(require('./controller/board')), ['controller'])
    .share('controller.issues', jimple.protect(require('./controller/issues')), ['controller'])
    .share('controller.projects', jimple.protect(require('./controller/projects')), ['controller'])
    .share('http.client', jimple.protect(require('request')))
    .share('http.cookie', jimple.protect(require('cookie-parser')()), ['middleware'])
    .share('http.body', jimple.protect(require('body-parser')()), ['middleware'])
    .share('http.response', jimple.protect(require('./lib/middleware/response.js')), ['middleware'])
    .share('static', jimple.protect(express.static(path.join(__dirname, '..', 'client', 'public'))), ['middleware'])
;
