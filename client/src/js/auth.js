angular.module('laboard-frontend')
    .config(['AuthenticateJSProvider',
        function(AuthenticateJSProvider) {
            AuthenticateJSProvider.setConfig({
                host: '/',
                loginUrl: 'login',
                logoutUrl: 'logout',
                loggedinUrl: 'login/check',

                unauthorizedPage: '/unauthorized',
                targetPage: '/',
                loginPage: '/login'
            });
        }
    ]);
