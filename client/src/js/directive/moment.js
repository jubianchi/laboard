angular.module('laboard-frontend')
    .directive('moment', [
        '$timeout',
        function($timeout) {
            return {
                restrict: 'E',
                template: '<time>{{fromNow}}</time>',
                link: function(scope, element, attrs) {
                    var update = function() {
                        var datetime = scope.$eval(attrs.datetime);

                        element.attr('datetime', datetime);

                        if (datetime) {
                            element.text(moment(datetime).fromNow());
                            unwatch();
                        }

                        $timeout(update, 10000);
                    };

                    var unwatch = scope.$watch(attrs.datetime, update);
                }
            }
        }
    ]);
