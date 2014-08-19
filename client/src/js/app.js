angular.module('laboard-frontend',[
    'ui.router',
    'ui.bootstrap',
    'ui.gravatar',
    'ngRoute',
    'restangular',
    'authenticate.js',
    'chieffancypants.loadingBar',
    'ngDraggable'
]);

angular.module('laboard-frontend')
    .config([
        'cfpLoadingBarProvider',
        function(cfpLoadingBarProvider) {
            cfpLoadingBarProvider.includeSpinner = false;
            cfpLoadingBarProvider.includeBar = true;
        }
    ]);

angular.module('laboard-frontend')
    .run(['Restangular', '$state', '$rootScope', 'AuthenticateJS', 'Referer', 'ColumnsRepository', '$modal', 'LABOARD_CONFIG', 'IssuesRepository', 'ProjectsRepository',
        function(Restangular, $state, $rootScope, Auth, Referer, ColumnsRepository, $modal, LABOARD_CONFIG, IssuesRepository, ProjectsRepository) {
            Restangular.setErrorInterceptor(function(response) {
                if(response.status === 401) {
                    $rootScope.project = null;
                    $rootScope.user = null;

                    $state.go('login');

                    return false;
                }
            });

            var isFirstRun = true;
            $rootScope.$on('$stateChangeStart', function (ev, to, toParams) {
                if (!Auth.authorize(to.security)) {
                    ev.preventDefault();
                    isFirstRun = false;

                    if (Auth.isLoggedIn()) {
                        $rootScope.project = null;
                        $rootScope.user = null;

                        $state.transitionTo('unauthorized');
                    } else {
                        $rootScope.project = null;
                        $rootScope.user = null;

                        var referer = $state.href(to.name, toParams);
                        Referer.set(referer.substring(1));
                        $state.transitionTo('login');
                    }
                } else if (isFirstRun) {
                    Auth.check();
                    isFirstRun = false;
                }
            });

            $rootScope.focusSearch = function() {
                $('[data-ng-model=globalSearch]').focus();
            };

            $rootScope.LABOARD_CONFIG = LABOARD_CONFIG;
        }
    ]);
