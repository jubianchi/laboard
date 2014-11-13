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
                                $element.removeClass('navbar-default');
                                $element.addClass('navbar-inverse');
                                $('img:first', $element).attr('src', '/assets/images/logo_inverse.png');
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
                                $element.removeClass('navbar-inverse');
                                $element.addClass('navbar-default');
                                $('img:first', $element).attr('src', '/assets/images/logo.png');
                            },
                            500
                        );
                    });
                }
            };
        }
    ]);
