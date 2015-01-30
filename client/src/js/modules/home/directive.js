angular.module('laboard-frontend')
    .directive('navbar', [
        '$rootScope', '$timeout',
        function($root, $timeout) {
            var cancel;

            return {
                restrict: 'A',
                link: function($scope, $element, $attrs) {
                    $root.$on('socket.disconnect', function() {
                        if (cancel) {
                            $timeout.cancel(cancel);
                        }

                        cancel = $timeout(
                            function() {
                                $element.addClass('disconnected');
                            },
                            500
                        );
                    });

                    $root.$on('socket.ready', function() {
                        if (cancel) {
                            $timeout.cancel(cancel);
                        }

                        cancel = $timeout(
                            function() {
                                $element.removeClass('disconnected');
                            },
                            500
                        );
                    });
                }
            };
        }
    ]);
