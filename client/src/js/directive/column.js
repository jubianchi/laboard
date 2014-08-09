angular.module('laboard-frontend')
    .directive('column', [
        function() {
            return {
                restrict: 'A',
                link: function($scope, $element, $attrs) {
                    var resize = function() {
                        $element
                            .css('height', $(window).height() - 70)
                            .children('.panel-body')
                                .css('height', $(window).height() - (70 + 43));
                    };

                    resize();

                    $(window).resize(resize);
                }
            };
        }
    ]);
