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
                    views: {
                        '': {
                            templateUrl: 'home/partials/home.html',
                            controller: 'HomeController'
                        }
                    },
                    security: true
                })
                    .state('home.project', {
                        url: ":namespace/:project",
                        views: {
                            '': {
                                templateUrl: 'project/partials/project.html',
                                controller: 'ProjectController'
                            }
                        },
                        security: true
                    })
                        .state('home.project.metrics', {
                            url: "/metrics",
                            views: {
                                '': {
                                    templateUrl: 'metrics/partials/metrics.html',
                                    controller: 'MetricsController'
                                },
                                'menu@home': {
                                    templateUrl: 'metrics/partials/menu.html',
                                    controller: 'MetricsMenuController'
                                }
                            },
                            security: true
                        })
            ;
        }
    ]);
