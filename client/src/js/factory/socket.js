angular.module('laboard-frontend')
    .factory('SocketFactory', [
        '$rootScope',
        function($root) {
            /*var handler = function(data) {
                    if (data.namespace + '/' + data.project !== $root.project.path_with_namespace) return;

                    $root.$apply(
                        function() {
                            IssuesRepository.one(data.issue.id)
                                .then(
                                function(issue) {
                                    $root.$broadcast('issue.update', issue);
                                }
                            );
                        }
                    );
                },*/
            var connected = false,
                handlers = {},
                socket;

            /*$root.$on('socket.ready', function(e, socket) {
                socket.on('issue.update', handler);
                socket.on('issue.edit', handler);
            });*/

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
