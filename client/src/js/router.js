angular.module('laboard-frontend')
    .config(['$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/');

            $stateProvider
                .state('login', {
                    url: '/login',
                    templateUrl: 'login/partials/login.html'
                })

                .state('logout', {
                    url: '/logout',
                    controller: function (AuthenticateJS, $state) {
                        AuthenticateJS.logout()
                            .then(
                                function () {
                                    $state.go('login');
                                }
                            );
                    },
                    security: true
                })

                .state('home', {
                    url: "/",
                    templateUrl: 'home/partials/home.html',
                    controller: 'HomeController',
                    security: true
                })
                    .state('home.project', {
                        url: ":namespace/:project",
                        templateUrl: 'project/partials/project.html',
                        controller: 'ProjectController',
                        security: true
                    })
                        .state('home.project.metrics', {
                            url: "/metrics",
                            templateUrl: 'metrics/partials/metrics.html',
                            controller: 'MetricsController',
                            security: true
                        })
            ;
        }
    ]);
