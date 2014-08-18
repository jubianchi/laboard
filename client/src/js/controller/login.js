angular.module('laboard-frontend')
    .controller('LoginController', [
        '$scope', '$rootScope', 'AuthenticateJS', '$state', 'ProjectsRepository', 'SocketFactory',
        function($scope, $rootScope, AuthenticateJS, $state, ProjectsRepository, SocketFactory) {
            $rootScope.$on('AuthenticateJS.login', function(event, user) {
                $rootScope.loggedin = true;
                $rootScope.user = user;
                $rootScope.projects = ProjectsRepository;

                SocketFactory.connect();
            });

            $rootScope.$on('AuthenticateJS.logout', function(event) {
                $rootScope.loggedin = false;
                $rootScope.user = null;
                $rootScope.project = null;

                $state.go('login');
            });
        }
    ]);
