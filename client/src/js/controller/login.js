angular.module('laboard-frontend')
    .controller('LoginController', [
        '$scope', '$rootScope', 'AuthenticateJS', '$state', 'ProjectsRepository', '$modal', 'ColumnsRepository',
        function($scope, $rootScope, AuthenticateJS, $state, ProjectsRepository, $modal, ColumnsRepository) {
            $rootScope.$on('AuthenticateJS.login', function(event, user) {
                $rootScope.loggedin = true;
                $rootScope.user = user;
                $rootScope.projects = ProjectsRepository;

                $rootScope.socket.io.connect();
            });

            $rootScope.$on('AuthenticateJS.logout', function(event) {
                $rootScope.loggedin = false;
                $rootScope.user = null;
                $rootScope.project = null;

                $rootScope.socket.io.disconnect();

                $state.go('login');
            });
        }
    ]);
