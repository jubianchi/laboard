angular.module('laboard-frontend')
    .directive('authorize', [
        '$rootScope', 'AuthorizationFactory',
        function($root, $authorization) {
            return {
                restrict: 'A',
                link: function($scope, $element, $attrs) {
                    var check = function() {
                        if (!$authorization.authorize($attrs.authorize)) {
                            $element.hide();
                        } else {
                            $element.css('display', '');
                        }
                    };

                    $root.$on('project.select', check);

                    check();
                }
            };
        }
    ])
    .directive('authorizeUnless', [
        '$rootScope', 'AuthorizationFactory',
        function($root, $authorization) {
            return {
                restrict: 'A',
                link: function($scope, $element, $attrs) {
                    var check = function() {
                        if (!$authorization.authorize($attrs.authorizeUnless)) {
                            $element.css('display', '');
                        } else {
                            $element.hide();
                        }
                    };

                    $root.$on('project.select', check);

                    check();
                }
            };
        }
    ]);
