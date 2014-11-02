angular.module('laboard-frontend')
    .directive('navbar', [
        '$rootScope',
        function($root) {
            return {
                restrict: 'A',
                link: function($scope, $element, $attrs) {
                    $root.$on('socket.disconnect', function() {
                        $element.removeClass('navbar-default');
                        $element.addClass('navbar-inverse');
                        $('img:first', $element).attr('src', '/assets/images/logo_inverse.png');
                    });

                    $root.$on('socket.reconnect', function() {
                        $element.removeClass('navbar-inverse');
                        $element.addClass('navbar-default');
                        $('img:first', $element).attr('src', '/assets/images/logo.png');
                    });
                }
            };
        }
    ]);
