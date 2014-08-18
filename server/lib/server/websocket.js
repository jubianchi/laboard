var cookie = require('cookie'),
    _ = require('lodash'),
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
                } catch(e) {}

                if (!token || !token.private_token) {
                    return next(new Error('Unauthorized'));
                }

                gitlab.auth(token.private_token, function(err, body) {
                    socket.token = body;

                    if (!socket.token || !socket.token.private_token) {
                        return next(new Error('Unauthorized'));
                    }

                    projects.all(
                        socket.token.private_token,
                        function(err, resp, projects) {
                            if (err) {
                                return next(err);
                            }

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
    start: function (server) {
        if (this.websocket === null) {
            if(this.logger) this.logger.info('Listening on port %d', server.address().port);

            this.websocket = setup(require('socket.io')(server), this.gitlab, this.projects);

            this.websocket.sockets.on('connection', function(socket) {
                socket.emit('message', { message: 'laboard' });
            });
        }

        return this;
    },

    broadcast: function(event, data) {
        this.websocket.sockets.sockets.forEach(function(socket) {
            socket.emit(event, data);
        });
    }
};
