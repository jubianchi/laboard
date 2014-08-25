angular.module('laboard-frontend')
    .factory('AuthorizationFactory', [
        '$rootScope',
        function($root) {
            return {
                authorize: function(level) {
                    var authorized = !!$root.user && !!$root.project;

                    authorized = authorized && (
                        (level === 'guest' && $root.project.access_level >= 10) ||
                        (level === 'reporter' && $root.project.access_level >= 20) ||
                        (level === 'developer' && $root.project.access_level >= 30) ||
                        (level === 'master' && $root.project.access_level >= 40) ||
                        (level === 'owner' && $root.project.access_level >= 50)
                    );

                    return authorized;
                }
            }
        }
    ]);
