angular.module('laboard-frontend')
    .directive('zoomable', [
        '$rootScope',
        function($root) {
            return {
                restrict: 'A',
                link: function($scope, $element, $attrs) {
                    var viewportWidth,
                        escape = function(e) {
                            if (e.keyCode === 27) {
                                unzoom();
                            }
                        },
                        zoom = function() {
                            viewportWidth = $(window).width();

                            $element.originalBounds = {
                                top: $element.offset().top,
                                left: $element.offset().left,
                                width: $element.outerWidth(),
                                height: $element.outerHeight(),
                                parent: $element.parent()
                            };

                            if (!$element.originalBounds.cont) {
                                $element.originalBounds.cont = $('<div/>');
                                $element.originalBounds.cont.click(function(e) {
                                    if ($(e.target).is($element.originalBounds.cont)) {
                                        unzoom();
                                    }
                                });
                                $(document).on('keyup', escape);
                            }

                            $('#overlay')
                                .after($element.originalBounds.cont)
                                .addClass('modal-backdrop fade in');

                            $element
                                .addClass('zooming')
                                .css({
                                    position: 'absolute',
                                    left: $element.originalBounds.left,
                                    top: $element.originalBounds.top,
                                    width: $element.originalBounds.width,
                                    height: $element.originalBounds.height
                                })
                                .appendTo($element.originalBounds.cont)
                                .animate({
                                    top: '30px',
                                    left: (viewportWidth - $element.originalBounds.width) / 2
                                }, 300)
                                .animate({
                                    width: '80%',
                                    left: '10%'
                                }, 300, function() {
                                    $element
                                        .removeClass('zooming')
                                        .addClass('zoom');
                                    $('.panel-body', $element).attr('data-ng-prevent-drag', '');
                                });

                            $element.zoomed = true;
                        },
                        unzoom = function() {
                            viewportWidth = $(window).width();

                            $element
                                .removeClass('zoom')
                                .addClass('unzooming');

                            $('.panel-body', $element).animate({
                                height: 0,
                                'min-height': 0,
                                'padding': 0
                            }, 1, function() {
                                $element
                                    .delay(250)
                                    .animate({
                                        left: (viewportWidth - $element.originalBounds.width) / 2,
                                        width: $element.originalBounds.width
                                    }, 300)
                                    .animate({
                                        left: $element.originalBounds.left - 5,
                                        top: $element.originalBounds.top - 5,
                                        width: $element.originalBounds.width,
                                        height: $element.originalBounds.height
                                    }, 300, function() {
                                        $('.panel-body', $element).css('height', '');
                                        $element
                                            .appendTo($element.originalBounds.parent)
                                            .css({
                                                position: '',
                                                left: '',
                                                top: '',
                                                width: '',
                                                height: ''
                                            })
                                            .removeClass('unzooming');

                                        $element.find('.panel-body').css({
                                            'min-height': '',
                                            'padding': ''
                                        });

                                        $element.originalBounds.cont.remove();
                                        $('.panel-body', $element).attr('data-ng-prevent-drag', null);
                                        $('#overlay').removeClass('modal-backdrop fade in');
                                    });
                            });

                            $element.zoomed = false;
                            $(document).unbind('keyup', escape);
                        };

                    $('.btn-zoom', $element).click(function() {
                        if ($element.zoomed) {
                            unzoom();
                        } else {
                            zoom();
                        }
                    });
                }
            };
        }
    ])
    .directive('collapsible', [
        function() {
            return {
                restrict: 'A',
                link: function($scope, $element, $attrs) {
                    var panel = $('.panel-body', $element),
                        body = $('.issue-body', panel);

                    $element.hover(
                        function() {
                            panel.css('max-height', body.outerHeight());
                        },
                        function() {
                            panel.css('max-height', '');
                        }
                    );
                }
            };
        }
    ])
    .directive('draggable', [
        function() {
            return {
                restrict: 'A',
                link: function($scope, $element, $attrs) {
                    $element.mousedown(function() {
                        $element.css('width', $element.outerWidth());
                    });

                    $element.mouseup(function() {
                        $element.css('width', '');
                    });
                }
            };
        }
    ]);
