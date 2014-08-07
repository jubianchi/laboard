angular.module('laboard-frontend')
    .directive('autoFocus', [
        function() {
            return {
                restrict: 'A',
                link: function($scope, $element) {
                    if ($element.is(':visible') && $element.is(':enabled')) {
                        $element.focus();
                    }
                }
            };
        }
    ]);
