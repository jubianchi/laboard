angular.module('laboard-frontend')
    .factory('AuthorizationFactory', [
        '$rootScope',
        function($root) {
            return {
                authorize: function(level, compare) {
                    var authorized = !!$root.user && !!$root.project;

                    if (!compare) {
                        compare = function (a, b) { return a >= b; };
                    }

                    authorized = authorized && (
                        (level === 'guest' && compare($root.project.access_level, 10)) ||
                        (level === 'reporter' && compare($root.project.access_level, 20)) ||
                        (level === 'developer' && compare($root.project.access_level, 30)) ||
                        (level === 'master' && compare($root.project.access_level, 40)) ||
                        (level === 'owner' && compare($root.project.access_level, 50))
                    );

                    return authorized;
                }
            }
        }
    ]);
