angular.module('laboard-frontend')
    .config(['$stateProvider', '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/');

            $stateProvider
                .state('login', {
                    url: '/login',
                    templateUrl: "partials/login.html"
                })

                .state('logout', {
                    url: '/logout',
                    controller: function(AuthenticateJS, $state) {
                        AuthenticateJS.logout()
                            .then(function() {
                                $state.go('login');
                            });
                    },
                    security: true
                })

                .state('home', {
                    url: "/",
                    templateUrl: 'partials/home.html',
                    controller: 'HomeController',
                    security: true
                })
            ;
        }
    ]);
