var Jimple = require("./lib/jimple"),
    fs = require('fs'),
    path = require('path'),
    express = require('express'),
    mysql = require('mysql'),
    jimple = module.exports = new Jimple();

jimple
    .share('config', function() {
        var config = require('../config/server.json');

        if (fs.existsSync(config.data_dir) === false) {
            fs.mkdirSync(config.data_dir);
        }

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
                    res.error.forbidden({});
                } else {
                    container.get('gitlab.projects').one(
                        req.user.private_token,
                        req.params.ns,
                        req.params.name,
                        function(err, resp, body) {
                            if (err) {
                                res.error(err);
                            } else {
                                authorized = authorized && (
                                    (level === 'guest' && body.access_level >= 10) ||
                                    (level === 'reporter' && body.access_level >= 20) ||
                                    (level === 'developer' && body.access_level >= 30) ||
                                    (level === 'master' && body.access_level >= 40) ||
                                    (level === 'owner' && body.access_level >= 50)
                                );

                                if (authorized) {
                                    next();
                                } else {
                                    res.error.forbidden({});
                                }
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
    .share('server.websocket', function(container) {
        var Websocket = require('./lib/server/websocket');

        return new Websocket(container.get('gitlab'), container.get('gitlab.projects'), container.get('logger'));
    })
    .share('server.websocket.adapter', function(container) {
        var redis = require('socket.io-redis');

        if (!container.get('config').redis) {
            return;
        }

        return redis({ host: container.get('config').redis.host, port: container.get('config').redis.port });
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
            container.get('gitlab.formatter')
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

        container.get('auth').setup(application);
        container.get('router').setup(application);

        return application;
    })
    .share('server', function(container) {
        var http = container.get('server.http'),
            server = http.start(container.get('app')).server;

        container.get('server.websocket').start(server, container.get('server.websocket').start(server, container.get('server.websocket.adapter')));

        return http;
    })
    .share('socket', function(container) {
        return container.get('server.websocket').websocket;
    })
    .share('http.client', function(container) {
        var request = require('request');

        return request.defaults(container.get('config').request || {});
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
    .share('static', jimple.protect(express.static(path.join(__dirname, '..', 'client', 'public'))), ['middleware'])
;
