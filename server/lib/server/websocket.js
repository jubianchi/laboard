var cookie = require('cookie'),
    _ = require('lodash'),
    q = require('q'),
    websocket = module.exports = function server(gitlab, projects, logger) {
        this.logger = logger;
        this.gitlab = gitlab;
        this.projects = projects;
        this.websocket = null;
    },
    setup = function(server, gitlab, projects) {
        server.use(
            function (socket, next) {
                var handshake = socket.request;

                if (!handshake.headers.cookie) {
                    return next(new Error('Unauthorized'));
                }

                var cookies = cookie.parse(handshake.headers.cookie);

                if (!cookies.access_token) {
                    return next(new Error('Unauthorized'));
                }

                try {
                    var token = JSON.parse(cookies.access_token);
                } catch (e) {}

                if (!token || !token.private_token) {
                    return next(new Error('Unauthorized'));
                }

                gitlab.auth(token.private_token, function(err, body) {
                    socket.token = body;

                    if (!socket.token || !socket.token.private_token) {
                        return next(new Error('Unauthorized'));
                    }

                    var page = 0,
                        all = [],
                        fetch = function(deferred) {
                            projects.all(
                                socket.token.private_token,
                                function (err, resp, body) {
                                    if (err) {
                                        deferred.reject();
                                    } else {
                                        all = all.concat(body);

                                        if (resp.links.next) {
                                            fetch(deferred);
                                        } else {
                                            deferred.resolve(all);
                                        }
                                    }
                                },
                                {
                                    page: (++page)
                                }
                            );

                            return deferred.promise;
                        };

                    fetch(q.defer())
                        .then(
                            function(projects) {
                                socket.token.projects = _.pluck(projects, 'path_with_namespace');

                                var emit = socket.emit;

                                socket.emit = function(event, data) {
                                    if (socket.token.projects.indexOf(data.namespace + '/' + data.project) > -1) {
                                        emit.apply(socket, Array.prototype.slice.call(arguments));
                                    }
                                };

                                next();
                            }
                        );
                });
            }
        );

        return server;
    };

websocket.prototype = {
    start: function (server, adapter) {
        if (this.websocket === null) {
            var io = require('socket.io')(server);

            if (this.logger) {
                this.logger.info('Websocket listening');
            }

            this.websocket = setup(io, this.gitlab, this.projects);

            if (adapter) {
                io.adapter(adapter);
            }

            this.websocket.sockets.on('connection', function(socket) {
                socket.emit('message', { message: 'laboard' });
            });
        }

        return this;
    },

    emit: function(event, data) {
        if (this.websocket) {
            this.websocket.emit(event, data);
        }
    }
};
