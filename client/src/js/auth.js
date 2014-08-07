angular.module('laboard-frontend')
    .config(['AuthenticateJSProvider',
        function(AuthenticateJSProvider) {
            AuthenticateJSProvider.setConfig({
                host: '/',
                loginUrl: 'login',
                logoutUrl: 'logout',
                loggedinUrl: 'login/check',

                unauthorizedPage: '/unauthorized',  // url (frontend) of the unauthorized page
                targetPage: '/',           // url (frontend) of the target page on login success
                loginPage: '/login'                 // url (frontend) of the login page
            });
        }
    ]);
