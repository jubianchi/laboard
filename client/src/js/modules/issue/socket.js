angular.module('laboard-frontend')
    .factory('IssuesSocket', [
        'SocketFactory',
        function($socket) {
            return {
                on: function(event, callback) {
                    $socket.on('issue.' + event, callback);

                    return this;
                }
            }
        }
    ]);
