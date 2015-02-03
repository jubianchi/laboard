var Jimple = require("./lib/jimple"),
    fs = require('fs'),
    path = require('path'),
    express = require('express'),
    mysql = require('mysql'),
    jimple = module.exports = new Jimple();

jimple
    .share('config', function() {
        var config = require('../config/server.json');

        if (!config.column_prefix) {
            config.column_prefix = 'column:';
        }

        if (!config.theme_prefix) {
            config.theme_prefix = 'theme:';
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
    .share('authorization', function(container) {
        return function(level) {
            return function(req, res, next) {
                var authorized = !!req.user;

                if (!authorized) {
                    res.error.forbidden();
                } else {
                    container.get('gitlab.projects').one(req.user.private_token, req.params.ns, req.params.name)
                        .then(
                            function(project) {
                                authorized = authorized && (
                                    (level === 'guest' && project.access_level >= 10) ||
                                        (level === 'reporter' && project.access_level >= 20) ||
                                        (level === 'developer' && project.access_level >= 30) ||
                                        (level === 'master' && project.access_level >= 40) ||
                                        (level === 'owner' && project.access_level >= 50)
                                    );

                                if (authorized) {
                                    next();
                                } else {
                                    res.error.forbidden();
                                }
                            }
                        );
                }
            };
        }
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
    .share('redis', function(container) {
        var redis = require('redis'),
            client = redis.createClient(container.get('config').redis.port, container.get('config').redis.host);

        return client;
    })
    .share('redis.pub', function(container) {
        var redis = require('redis'),
            client = redis.createClient(
                container.get('config').redis.port,
                container.get('config').redis.host,
                {
                    return_buffers: true
                }
            );

        return client;
    })
    .share('redis.sub', function(container) {
        var redis = require('redis'),
            client = redis.createClient(
                container.get('config').redis.port,
                container.get('config').redis.host,
                {
                    detect_buffers: true
                }
            );

        return client;
    })
    .share('websocket.server', function(container) {
        var Websocket = require('./lib/server/websocket');

        return new Websocket(container.get('gitlab'), container.get('gitlab.projects'), container.get('logger'));
    })
    .share('websocket.server.adapter', function(container) {
        var redis = require('socket.io-redis');

        return redis({
            pubClient: container.get('redis.pub'),
            subClient: container.get('redis.sub')
        });
    })
    .share('websocket.emitter', function(container) {
        return require('socket.io-emitter')(container.get('redis.pub'));
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
    .share('gitlab.labels', function(container) {
        var Projects = require('./lib/gitlab/labels');

        return new Projects(container.get('gitlab'));
    })
    .share('gitlab.issues', function(container) {
        var Issues = require('./lib/gitlab/issues');

        return new Issues(
            container.get('gitlab'),
            container.get('gitlab.projects'),
            container.get('gitlab.formatter'),
            container
        );
    })
    .define('mysql', function(container) {
        var connection = mysql.createConnection(container.get('config').mysql);

        connection.execute = function(sql, params, cb) {
            connection.connect();

            if (typeof params === "function") {
              cb = params;
              params = [];
            }

            cb = cb || function() {};

            connection.query(sql, params, function(err, rows) {
              cb(err, rows);
            });

            connection.end();
        };

        return connection;
    })
    .share('app', function(container) {
        var application = express();

        container.getTagged('middleware').forEach(function(name) {
            container.get('logger').info('Loading middleware %s', name);

            application.use(container.get(name));
        });

        return application;
    })
    .share('server', function(container) {
        var http = container.get('server.http'),
            app = container.get('app'),
            server = http.start(container.get('app')).server;

        container.get('auth').setup(app);
        container.get('router').setup(app);

        container.get('websocket.server').start(server, container.get('websocket.server.adapter'));

        return http;
    })
    .share('socket', function(container) {
        return container.get('websocket.server').websocket;
    })
    .share('http.client', function(container) {
        var request = require('request');

        return request.defaults(container.get('config').request || {});
    })
    .share('notifier.issues', function(container) {
        var notifier = require('./notifier/issues');

        return new notifier(container.get('websocket.emitter'));
    })
    .share('notifier.columns', function(container) {
        var notifier = require('./notifier/columns');

        return new notifier(container.get('websocket.emitter'));
    })
    .share('controller.auth', jimple.protect(require('./controller/auth')), ['controller'])
    .share('controller.board', jimple.protect(require('./controller/board')), ['controller'])
    .share('controller.issues', jimple.protect(require('./controller/issues')), ['controller'])
    .share('controller.projects', jimple.protect(require('./controller/projects')), ['controller'])
    .share('http.logger', jimple.protect(require('morgan')('combined')), ['middleware'])
    .share('http.cookie', jimple.protect(require('cookie-parser')()), ['middleware'])
    .share('http.body.url', jimple.protect(require('body-parser').urlencoded({ extended: true })), ['middleware'])
    .share('http.body.json', jimple.protect(require('body-parser').json()), ['middleware'])
    .share('http.response', jimple.protect(require('./lib/middleware/response.js')), ['middleware'])
    .share('static', jimple.protect(express.static(path.join(__dirname, '..', 'client', 'public'))))
;
