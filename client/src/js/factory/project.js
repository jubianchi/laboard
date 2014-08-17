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
                        return Restangular.one('projects/' + id).get()
                            .then(function(project) {
                                return Restangular.all('projects/' + id + '/members').getList()
                                    .then(function(members) {
                                        project.members = members;

                                        return project;
                                    });
                            });
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
