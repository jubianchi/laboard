angular.module('laboard-frontend')
    .directive('counter', [
        '$timeout',
        function($timeout) {
            return {
                restrict: 'E',
                template: '<small class="text-muted">{{count}} {{label}}</small>',
                link: function($scope, $element, $attrs) {
                    var singular = $scope.$eval($attrs.singular),
                        plural = $scope.$eval($attrs.plural || $attrs.label);

                    var update = function() {
                        var value = $scope.$eval($attrs.value),
                            max = $scope.$eval($attrs.max);

                        $scope.label = value > 1 ? plural : singular;

                        if (max > 0) {
                            $scope.label = ' / ' + max + ($scope.label ? ' ' + $scope.label : '');
                        }

                        $scope.count = value;
                    };

                    $scope.$watch($attrs.value, update);
                    $scope.$watch($attrs.max, update);
                }
            }
        }
    ]);
