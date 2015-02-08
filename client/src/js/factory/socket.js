angular.module('laboard-frontend')
    .factory('SocketFactory', [
        '$rootScope', '$window', '$location',
        function($root, $window, $location) {
            var connected = false,
                handlers = {},
                socket;

            $root.$on(
                'socket.ready',
                function (event, socket) {
                    connected = true;

                    Object.keys(handlers).forEach(function(event) {
                        handlers[event].forEach(function(callback) {
                            socket.on(event, callback);
                        });
                    });
                }
            );

            return {
                connect: function() {
                    if (socket) {
                        socket.connect();
                    } else {
                        socket = $window.io.connect($location.protocol() + '://' + $location.host() + ':' + $location.port());
                    }

                    socket.on('connect', function() {
                        $root.$broadcast('socket.ready', socket);
                    });

                    socket.on('disconnect', function() {
                        $root.$broadcast('socket.disconnect', socket);
                    });

                    socket.on('reconnect', function() {
                        $root.$broadcast('socket.ready', socket);
                    });
                },

                disconnect: function() {
                    Object.keys(handlers).forEach(function(event) {
                        socket.removeAllListeners(event);
                    });

                    socket.disconnect();
                    socket.close();
                },

                on: function(event, callback) {
                    if (!handlers[event]) {
                        handlers[event] = [];
                    }

                    var handler = function(data) {
                        $root.$apply(function() {
                            var target = data.namespace + '/' + data.project;

                            if (target === $root.project.path_with_namespace) {
                                callback(data);
                            }
                        });
                    };

                    handlers[event].push(handler);

                    if (connected) {
                        socket.on(event, handler);
                    }

                    return this;
                }
            }
        }
    ]);
