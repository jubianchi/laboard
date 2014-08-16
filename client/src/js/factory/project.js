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
                    all: null,
                    one: function(id) {
                        return Restangular.one('projects/' + id).get();
                    }
                };

            $rootScope.$watch('user', function() {
                if ($rootScope.user) {
                    fetch();
                }
            });

            return repository;
        }
    ]);
