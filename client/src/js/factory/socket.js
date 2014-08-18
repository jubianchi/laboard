angular.module('laboard-frontend')
    .factory('SocketFactory', [
        '$rootScope', 'IssuesRepository',
        function($rootScope, IssuesRepository) {
            var handler = function(data) {
                    if (data.namespace + '/' + data.project !== $rootScope.project.path_with_namespace) return;

                    $rootScope.$apply(
                        function() {
                            IssuesRepository.one(data.issue.id)
                                .then(
                                function(issue) {
                                    $rootScope.$broadcast('issue.update', issue);
                                }
                            );
                        }
                    );
                },
                connected = false,
                handlers = {},
                socket;

            $rootScope.$on('socket.ready', function(e, socket) {
                socket.on('issue.update', handler);
                socket.on('issue.edit', handler);
            });

            return {
                connect: function() {
                    socket = io.connect(location.protocol + '//' + location.hostname + ':' + ($rootScope.LABOARD_CONFIG.socketIoPort || location.port));

                    socket.on('connect', function() {
                        connected = true;

                        $rootScope.$broadcast('socket.ready', socket);

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

                    handlers[event].push(callback);

                    if (connected) {
                        socket.on(event, callback);
                    }
                }
            }
        }
    ]);
