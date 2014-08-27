angular.module('laboard-frontend')
    .directive('loading', [
        '$parse',
        function($parse) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    scope.$watch(
                        $parse(attrs.loading),
                        function(value) {
                            if (!value) {
                                if ($('.spinner-container', element).size() === 0) {
                                    element.prepend('<div class="spinner-container large clearfix"><i class="fa fa-spinner fa-spin"></i></div>');
                                }
                            } else {
                                element.children('.spinner-container').remove();
                            }
                        }
                    );
                }
            };
        }
    ]);
