angular.module('laboard-frontend')
    .directive('column', [
        function() {
            return {
                restrict: 'A',
                link: function($scope, $element, $attrs) {
                    var resizeHeight = function() {
                            $element
                                .css('height', $(window).height() - 70)
                                .children('.panel-body')
                                    .css('height', $(window).height() - (70 + 43));
                        },
                        resizeWidth = function() {
                            var width = 100 / $scope.columns.all.length;

                            $('.column').css('width', width + '%');
                        },
                        resize = function() {
                            resizeHeight();
                            resizeWidth();
                        };

                    resize();

                    $(window).resize(resize);

                    $scope.$watch(function() { return $scope.columns.all.length; }, resizeWidth);
                }
            };
        }
    ]);
