angular.module('laboard-frontend')
    .directive('nyan', [
        function () {
            return {
                link: function (scope, element, attrs) {
                    var konami_keys = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65],
                        konami_index = 0,
                        body = $('body'),
                        doc = $(document),
                        img = $('<img src="assets/nyancat.gif" width="100" style="border: none; position: absolute; z-index: 9999;"/>'),
                        sound = $('<audio preload="auto"><source src="assets/nyancat.ogg" type="audio/ogg"/><source src="assets/nyancat.mp3" type="audio/mp3" /></audio>'),
                        reset = function() {
                            sound.get(0).pause();
                            sound.get(0).currentTime = 0;

                            img.css({
                                left: '-100px',
                                bottom: 0
                            });

                            konami_index = 0;
                            $(document).keydown(handler);
                        },
                        start = function() {
                            reset();

                            sound.get(0).volume = 0.5;
                            sound.get(0).play();
                            img.show().animate(
                                {
                                    "left": "+=" + parseInt(doc.width() + img.width()) + "px",
                                    "bottom": "+=" + parseInt(doc.height() + img.height()) + "px"
                                },
                                9000,
                                function() {
                                    img.remove();
                                    sound.remove();

                                    reset();
                                }
                            );
                        },
                        handler = function(e) {
                            if (e.keyCode === konami_keys[konami_index++]) {
                                if (konami_index === konami_keys.length) {
                                    $(document).unbind('keydown', arguments.callee);

                                    body.append(img);
                                    body.append(sound);

                                    start();
                                }
                            } else {
                                konami_index = 0;
                            }
                        };

                    $(document).keydown(handler);
                }
            };
        }
    ]);
