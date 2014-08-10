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
        function(cfpLoadingBarProvider, markedProvider) {
            cfpLoadingBarProvider.includeSpinner = false;
            cfpLoadingBarProvider.includeBar = true;
        }
    ]);

angular.module('laboard-frontend')
    .run(['Restangular', '$state', '$rootScope', 'AuthenticateJS', 'Referer', 'ColumnsRepository', '$modal', 'LABOARD_CONFIG',
        function(Restangular, $state, $rootScope, Auth, Referer, ColumnsRepository, $modal, LABOARD_CONFIG) {
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

            var modal;
            $rootScope.switchProject = function() {
                var open = function() {
                    modal = $modal
                        .open({
                            templateUrl: 'partials/project/modal.html',
                            backdrop: !!$rootScope.project || 'static',
                            keyboard: !!$rootScope.project
                        });

                    modal.result
                        .then(function(project) {
                            if(!project) {
                                open();
                            }
                        });
                };

                open();
            };

            $rootScope.selectProject = function(project) {
                $rootScope.project = project;

                if (modal) modal.close($rootScope.project)
            };

            $rootScope.create = function() {
                $modal
                    .open({
                        templateUrl: 'partials/column/modal.html',
                        controller: function($scope, $modalInstance) {
                            $scope.theme = 'default';
                            $scope.error = false;
                            $scope.closable = false;

                            $scope.save = function () {
                                var column = {
                                    title: $scope.title,
                                    theme: $scope.theme,
                                    closable: parseInt(column.closable, 10) || false,
                                    issues: []
                                };

                                ColumnsRepository.add(column)
                                    .then(
                                        $modalInstance.close,
                                        function() {
                                            $scope.error = true;
                                        }
                                    );
                            };
                        }
                    });
            };

            $rootScope.LABOARD_CONFIG = LABOARD_CONFIG;
        }
    ]);
