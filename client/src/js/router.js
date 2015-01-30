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
                            '@home': {
                                templateUrl: 'project/partials/project.html',
                                controller: 'ProjectController'
                            },
                            'menu': {
                                templateUrl: 'project/partials/menu.html',
                                controller: 'ProjectMenuController'
                            }
                        },
                        security: true
                    })
                        .state('home.project.query', {
                            url: "/q/:query",
                            views: {
                                '@home': {
                                    templateUrl: 'project/partials/project.html',
                                    controller: 'ProjectController'
                                },
                                'menu': {
                                    templateUrl: 'project/partials/menu.html',
                                    controller: 'ProjectMenuController'
                                }
                            },
                            security: true
                        })
                        .state('home.project.metrics', {
                            url: "/metrics",
                            views: {
                                '@home': {
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
