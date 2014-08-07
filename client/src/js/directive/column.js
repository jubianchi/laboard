angular.module('laboard-frontend')
    .directive('column', [
        function() {
            return {
                restrict: 'A',
                link: function($scope, $element) {
                    var padding = $element.attr('data-column-padding') || 85,
                        bodyPadding = $element.attr('data-column-body-padding') || 41;

                    var resize = function() {
                        $element
                            .height($(window).height() - padding)
                            .children('.panel-body')
                                .height($element.height() - bodyPadding);
                    };

                    resize();

                    $(window).resize(resize);
                }
            };
        }
    ]);
