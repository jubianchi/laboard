angular.module('laboard-frontend')
    .controller('LoginController', [
        '$scope', '$rootScope', 'AuthenticateJS', '$state', 'ProjectsRepository', '$modal', 'ColumnsRepository',
        function($scope, $rootScope, AuthenticateJS, $state, ProjectsRepository, $modal, ColumnsRepository) {
            $rootScope.$on('AuthenticateJS.login', function(event, user) {
                $rootScope.loggedin = true;
                $rootScope.user = user;
                $rootScope.projects = ProjectsRepository;
            });

            $rootScope.$on('AuthenticateJS.logout', function(event) {
                $rootScope.loggedin = false;
                $rootScope.user = null;
                $rootScope.project = null;

                $state.go('login');
            });

            $scope.switch = function() {
                $rootScope.project = null;

                $state.go('home');
            };

            $scope.create = function() {
                $modal
                    .open({
                        templateUrl: 'partials/column/modal.html',
                        controller: function($scope, $modalInstance) {
                            $scope.theme = 'default';
                            $scope.error = false;

                            $scope.save = function () {
                                var column = {
                                    title: $scope.title,
                                    theme: $scope.theme
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
        }
    ]);
