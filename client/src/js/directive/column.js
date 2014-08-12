angular.module('laboard-frontend')
    .directive('column', [
        function() {
            return {
                restrict: 'A',
                link: function($scope, $element, $attrs) {
                    var resizeHeight = function() {
                            $element
                                .css('height', $(window).height() - 50)
                                .children('.panel-body')
                                    .css('height', $(window).height() - (70 + 43));
                        },
                        resizeWidth = function() {
                            var width = 100;

                            if ($scope.columns.all) {
                                width = 100 / $scope.columns.all.length;
                            }


                            $('.column').css('width', width + '%');
                        },
                        resize = function() {
                            resizeHeight();
                            resizeWidth();
                        };

                    resize();

                    $(window).resize(resize);

                    $scope.$watch(
                        function() {
                            if ($scope.columns.all) {
                                return $scope.columns.all.length;
                            } else {
                                return 1;
                            }
                        },
                        resizeWidth
                    );
                }
            };
        }
    ]);
