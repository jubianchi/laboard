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
        function(Restangular, $state, $rootScope, Auth, Referer, $columns, $modal, LABOARD_CONFIG, $issues, $projects) {
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

            $rootScope.switchProject = function () {
                var open = function () {
                    modal = $modal
                        .open({
                            templateUrl: 'home/partials/projects.html',
                            backdrop: !!$rootScope.project || 'static',
                            keyboard: !!$rootScope.project,
                            controller: function ($scope) {
                                $scope.selectProject = function (project) {
                                    if (!$rootScope.project || project.path_with_namespace !== $rootScope.project.path_with_namespace) {
                                        $projects.one(project.path_with_namespace)
                                            .then(
                                            function (project) {
                                                $rootScope.project = project;

                                                if (modal) modal.close($rootScope.project);
                                            }
                                        );
                                    } else {
                                        if (modal) modal.close($rootScope.project);
                                    }
                                };
                            }
                        });

                    modal.result
                        .then(function (project) {
                            if(!project) {
                                open();
                            } else {
                                $columns.clear();
                                $issues.clear();

                                $state.transitionTo(
                                    'project',
                                    {
                                        namespace: project.path_with_namespace.split('/')[0],
                                        project: project.path_with_namespace.split('/')[1]
                                    }
                                );
                            }
                        });
                };

                open();
            };


            $rootScope.addColumn = function() {
                $modal
                    .open({
                        templateUrl: 'column/partials/modal.html',
                        controller: function ($scope, $modalInstance) {
                            $scope.theme = 'default';
                            $scope.error = false;

                            $scope.save = function () {
                                var column = {
                                    title: $scope.title,
                                    theme: $scope.theme,
                                    position: $columns.$objects.length
                                };

                                $columns.persist(column)
                                    .then(
                                    $modalInstance.close,
                                    function () {
                                        $scope.error = true;
                                    }
                                );
                            };
                        }
                    });
            };

            $rootScope.projects = $projects;
            $projects.all();
        }
    ]);
