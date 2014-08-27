angular.module('laboard-frontend')
    .directive('nyan', [
        function () {
            return {
                link: function (scope, element, attrs) {
                    var konamiKeys = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65],
                        konamiIndex = 0,
                        body = $('body'),
                        doc = $(document),
                        img, sound,
                        reset = function() {
                            sound.get(0).pause();
                            sound.get(0).currentTime = 0;

                            img.css({
                                left: '-100px',
                                bottom: 0
                            }).show();
                        },
                        start = function() {
                            sound.get(0).volume = 0.5;
                            sound.get(0).play();
                            img.animate(
                                {
                                    "left": parseInt(doc.width() + img.width()),
                                    "bottom": parseInt(doc.height() + img.height())
                                },
                                {
                                    queue: false,
                                    duration: 9000,
                                    complete: function() {
                                        konamiIndex = 0;
                                        doc.on('keydown', handler);
                                    }
                                }
                            );
                        },
                        handler = function(e) {
                            if (e.keyCode === konamiKeys[konamiIndex++]) {
                                if (konamiIndex === konamiKeys.length) {
                                    doc.off('keydown', handler);

                                    bootstrap(function () {
                                        reset();
                                        start();
                                    });
                                }
                            } else {
                                konamiIndex = 0;
                            }
                        },
                        bootstrap = function(cb) {
                            img = $('<img src="assets/nyancat.gif" width="100" style="border: none; position: absolute; z-index: 9999;"/>');
                            sound = $('<audio preload="auto"><source src="assets/nyancat.ogg" type="audio/ogg"/><source src="assets/nyancat.mp3" type="audio/mp3" /></audio>');

                            body.append(img.hide());
                            body.append(sound);

                            sound.get(0).addEventListener('loadedmetadata', function() {
                                cb()
                            });

                            bootstrap = function(cb) {
                                cb();
                            };
                        };

                    doc.on('keydown', handler);
                }
            };
        }
    ]);
