angular.module('laboard-frontend')
    .factory('ColumnsSocket', [
        'SocketFactory',
        function($socket) {
            return {
                on: function(event, callback) {
                    $socket.on('column.' + event, callback);

                    return this;
                }
            }
        }
    ]);
