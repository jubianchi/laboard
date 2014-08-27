angular.module('laboard-frontend')
    .directive('counter', [
        function() {
            return {
                restrict: 'E',
                template: '<small class="text-muted">{{count}}{{label}}</small>',
                link: function($scope, $element, $attrs) {
                    var singular = $attrs.singular,
                        plural = $attrs.plural || singular;

                    var update = function() {
                        var value = $scope.$eval($attrs.value),
                            max = $scope.$eval($attrs.max);

                        $scope.label = value > 1 ? plural : singular;

                        if (max > 0) {
                            $scope.label = '/ ' + max + ($scope.label ? ' ' + $scope.label : '');
                        }

                        $scope.count = value;
                        $scope.label = $scope.label ? ' ' + $scope.label : '';
                    };

                    $scope.$watch($attrs.value, update);
                    $scope.$watch($attrs.max, update);
                }
            }
        }
    ]);
