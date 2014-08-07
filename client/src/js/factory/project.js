angular.module('laboard-frontend')
    .factory('ProjectsRepository', [
        '$rootScope', 'Restangular',
        function($rootScope, Restangular) {
            var fetch = function() {
                    Restangular.all('projects').getList()
                        .then(
                            function (projects) {
                                repository.all = _.sortBy(projects, 'path_with_namespace');
                            }
                        );
                },
                repository = {
                    all: null
                };

            $rootScope.$watch('user', function() {
                if ($rootScope.user) {
                    fetch();
                }
            });

            return repository;
        }
    ]);
