angular.module('laboard-frontend')
    .factory('SocketFactory', [
        '$rootScope',
        function($root) {
            var connected = false,
                handlers = {},
                socket;

            return {
                connect: function() {
                    socket = io.connect(location.protocol + '//' + location.hostname + ':' + ($root.LABOARD_CONFIG.socketIoPort || location.port));

                    socket.on('connect', function() {
                        connected = true;

                        $root.$broadcast('socket.ready', socket);

                        Object.keys(handlers).forEach(function(event) {
                            handlers[event].forEach(function(callback) {
                                socket.on(event, callback);
                            });
                        });
                    });
                },

                on: function(event, callback) {
                    if (!handlers[event]) {
                        handlers[event] = [];
                    }

                    var handler = function(data) {
                        $root.$apply(function() {
                            var target = data.namespace + '/' + data.project;

                            if (data.namespace && data.project && target !== $root.project.path_with_namespace) return;

                            callback(data);
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
