angular.module('laboard-frontend')
    .directive('zoomable', [
        '$rootScope',
        function($root) {
            return {
                restrict: 'A',
                link: function($scope, $element, $attrs) {
                    var zoom = function() {
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
                                    if($(e.target).is($element.originalBounds.cont) && $element.zoomed) {
                                        unzoom();
                                    }
                                });
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
                                    width: '80%',
                                    left: '10%',
                                    top: '30px'
                                }, 250, function() {
                                    $element
                                        .removeClass('zooming')
                                        .addClass('zoom');
                                });

                            $element.zoomed = true;
                        },
                        unzoom = function() {
                            $element
                                .removeClass('zoom')
                                .addClass('unzooming')
                                .animate({
                                    left: $element.originalBounds.left,
                                    top: $element.originalBounds.top,
                                    width: $element.originalBounds.width,
                                    height: $element.originalBounds.height
                                }, 250, function() {
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

                                    $element.originalBounds.cont.remove();
                                    $('#overlay').removeClass('modal-backdrop fade in');
                                });

                            $element.zoomed = false;
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
    ]);
