angular.module('laboard-frontend')
    .directive('authorize', [
        '$rootScope', 'AuthorizationFactory',
        function($root, $authorization) {
            return {
                restrict: 'A',
                link: function($scope, $element, $attrs) {
                    if (!$authorization.authorize($attrs.authorize)) {
                        $element.remove();
                    }
                }
            };
        }
    ]);
