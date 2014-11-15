function alpha(color, A) {
    var rgb = torgb(color);

    return 'rgba(' + rgb.R + ',' + rgb.G + ',' + rgb.B + ',' + A + ')';
}

function lumi(color, A) {
    var rgb = torgb(color),
        hex = '#';

    Object.keys(rgb).forEach(function(key) {
        var c = Math.round(Math.min(Math.max(0, rgb[key] + (rgb[key] * A)), 255)).toString(16);

        hex += ('00' + c ).substr(c.length);
    });

    return hex;
}

function torgb(color) {
    return {
        R: parseInt(color.substring(1,3),16),
        G: parseInt(color.substring(3,5),16),
        B: parseInt(color.substring(5,7),16)
    };
}


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
                                .css('height', height - (50 + (width > $(window).width() ? 5 : 0)))
                                .children('.panel-body')
                                    .css('height', height - (70 + 48 - (width > $(window).width() ? 0 : 5)));
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

                    $element.on('mousemove', '.issue.dragging', function(ev) {
                        var main = $element.closest('.main'),
                            moveLeft = function($e) {
                                var left = $e.offset().left,
                                    width = $e.width(),
                                    limit = $(document).width();

                                if ((left + width) > $(document).width() && (main.scrollLeft() + limit) < $element.width()) {
                                    main.stop(true, true).animate(
                                        { scrollLeft: '+=5' },
                                        50,
                                        function() { moveLeft($e); }
                                    );
                                }
                            },
                            moveRight = function($e) {
                                var left = $e.offset().left;

                                if (left <= 0 && main.scrollLeft() > 0) {
                                    main.stop(true, true).animate(
                                        { scrollLeft: '-=5' },
                                        50,
                                        function() { moveRight($e); }
                                    );
                                }
                            };

                        moveLeft($(this));
                        moveRight($(this));
                    });
                }
            };
        }
    ])
    .directive('column', [
        function() {
            return {
                restrict: 'A',
                link: function($scope, $element, $attrs) {
                    $scope.$watch(
                        function() {
                            return $attrs.columnColor;
                        },
                        function(color) {
                            if (color) {
                                $('> .panel-heading, > .panel-heading .btn', $element).css({
                                    'background-color': alpha(color, 0.4),
                                    'border-color': color,
                                    'color': lumi(color, -0.4)
                                });

                                $('> .panel-heading .text-muted', $element).css({
                                    'color': lumi(color, -0.4)
                                });

                                $element.css({
                                    'border-color': color
                                });
                            }
                        }
                    );
                }
            }
        }
    ]);
