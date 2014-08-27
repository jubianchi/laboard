angular.module('laboard-frontend')
    .directive('columns', [
        function() {
            return {
                restrict: 'A',
                link: function($scope, $element, $attrs) {
                    var resizeHeight = function() {
                            var height = $(window).height();

                            $('[data-column]', $element)
                                .css('height', height - 50)
                                .children('.panel-body')
                                    .css('height', height - (70 + 43));
                        },
                        resizeWidth = function() {
                            var columns = $('[data-column]', $element);

                            columns.css('width', (100 / (columns.size() || 1)) + '%');
                        },
                        resize = function() {
                            resizeHeight();
                            resizeWidth();
                        };

                    resize();

                    $(window).resize(resize);

                    $scope.$watch(
                        function() {
                            return $('[data-column]', $element).size();
                        },
                        resizeWidth
                    );
                }
            };
        }
    ]);
