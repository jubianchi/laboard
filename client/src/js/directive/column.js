angular.module('laboard-frontend')
    .directive('column', [
        function() {
            return {
                restrict: 'A',
                link: function($scope, $element, $attrs) {
                    var padding = $element.attr('data-column-padding') || 85,
                        bodyPadding = $element.attr('data-column-body-padding') || 43,
                        prop = 'height';

                    if(typeof $attrs.columnFluid !== "undefined") {
                        prop = 'max-' + prop;
                    }

                    var resize = function() {
                        $element
                            .css(prop, $(window).height() - padding)
                            .children('.panel-body')
                                .css(prop, $(window).height() - padding - bodyPadding);
                    };

                    resize();

                    $(window).resize(resize);
                }
            };
        }
    ]);
