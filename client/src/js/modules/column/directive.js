angular.module('laboard-frontend')
    .directive('columns', [
        '$rootScope',
        function($root) {
            var columnWidth = 300;

            return {
                restrict: 'A',
                link: function($scope, $element, $attrs) {
                    var resizeHeight = function() {
                            var height = $(window).height(),
                                width = $('.column-container').width();

                            $('[data-column]', $element)
                                .css('height', height - (50 + + (width > $(window).width() ? 5 : 0)))
                                .children('.panel-body')
                                    .css('height', height - (70 + 50 + (width > $(window).width() ? 5 : 0)));
                        },
                        resizeWidth = function() {
                            var columns = $('[data-column]', $element),
                                width = columns.size() * columnWidth;

                            if (width > $(window).width()) {
                                columns.css('width', columnWidth);

                                $('.column-container').width(width);
                            } else {
                                columns.css('width', (100 / (columns.size() || 1)) + '%');
                            }
                        },
                        resize = function() {
                            resizeWidth();
                            resizeHeight();
                        };

                    resize();

                    $(window).resize(resize);
                    $root.$on('column.ready', resize);

                    $scope.$watch(
                        function() {
                            return $('[data-column]', $element).size() || 1;
                        },
                        resize
                    );
                }
            };
        }
    ]);
