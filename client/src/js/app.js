angular.module('laboard-frontend', [
    'ui.router',
    'ui.bootstrap',
    'ui.gravatar',
    'ngRoute',
    'restangular',
    'authenticate.js',
    'chieffancypants.loadingBar',
    'ngDraggable',
    'highcharts-ng',
    'hc.marked'
]);

angular.module('laboard-frontend')
    .config([
        'cfpLoadingBarProvider', 'markedProvider',
        function(cfpLoadingBarProvider, markedProvider) {
            cfpLoadingBarProvider.includeSpinner = false;
            cfpLoadingBarProvider.includeBar = true;

            var renderer = new marked.Renderer();
            renderer.listitem = function(text) {
                var pattern = /^\s*\[( |x)\]/,
                    checkedPattern = /^\s*\[x\]/;

                if (pattern.exec(text)) {
                    var attr = ' type="checkbox" disabled="disabled"';

                    if (checkedPattern.exec(text)) {
                        attr += ' checked="checked"';
                    }
                    text = '<input' + attr + '/> ' + text.replace(pattern, '');
                }

                return '<li>' + text + '</li>'
            };

            renderer.image = function(href, title, text) {
                return '<img src="' + href + '"' + (title ? ' title="' + title + '"' : '') + (text ? ' alt="' + text + '"' : '') + ' class="img-responsive"/>';
            };

            markedProvider.setOptions({
                gfm: true,
                tables: true,
                renderer: renderer,
                highlight: function (code) {
                    return hljs.highlightAuto(code).value;
                }
            });
        }
    ]);

angular.module('laboard-frontend')
    .run([
        'Restangular', '$state', '$rootScope', 'AuthenticateJS', 'LABOARD_CONFIG', 'Referer', 'SocketFactory',
        function($rest, $state, $root, $auth, LABOARD_CONFIG, $referer, $socket) {
            $rest.setErrorInterceptor(function(response) {
                if (response.status === 401) {
                    $root.project = null;
                    $root.user = null;

                    $state.go('login');

                    return false;
                }
            });

            $root.$on('AuthenticateJS.login', function(event, user) {
                $root.loggedin = true;
                $root.user = user;

                $socket.connect();
            });

            $root.$on('AuthenticateJS.logout', function(event) {
                $root.loggedin = false;
                $root.user = null;

                $socket.disconnect();
                $state.go('login');
            });

            $root.$on('$stateChangeStart', function (ev, to, toParams) {
                if (!$auth.authorize(to.security)) {
                    ev.preventDefault();

                    $root.project = null;
                    $root.user = null;

                    if ($auth.isLoggedIn()) {
                        $state.go('unauthorized');
                    } else {
                        $referer.set($state.href(to.name, toParams).substring(1));

                        $state.go('login');
                    }
                } else {
                    if ($root.user) { return; }

                    $auth.check();
                }
            });

            $root.focusSearch = function() {
                $('[data-ng-model=globalSearch]').focus();
            };

            $root.LABOARD_CONFIG = LABOARD_CONFIG;
            $root.gitlabUrl = LABOARD_CONFIG.gitlabUrl;
        }
    ]);
