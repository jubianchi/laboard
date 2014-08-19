angular.module('laboard-frontend')
    .factory('ProjectsRepository', [
        '$rootScope', 'Restangular', '$q',
        function($root, $rest, $q) {
            var storage = [],
                fetch = function() {
                    var deferred = $q.defer();

                    $rest.all('projects')
                        .getList()
                        .then(
                            function (projects) {
                                storage = _.sortBy(projects, 'path_with_namespace');

                                deferred.resolve(projects);
                            },
                            deferred.reject
                        );

                    return deferred.promise;
                },
                fetchOne = function (id) {
                    return $rest.all('projects').one(id);
                },
                repository = {
                    all: function () {
                        var self = this,
                            deferred = $q.defer();

                        fetch()
                            .then(
                                function (projects) {
                                    self.all = function () {
                                        var deferred = $q.defer();

                                        deferred.resolve(projects);

                                        return deferred.promise;
                                    };

                                    deferred.resolve(projects);
                                },
                                deferred.reject
                            );

                        return deferred.promise;
                    },
                    one: function (id) {
                        return fetchOne(id).get();
                    },

                    add: function (project) {
                        var added = false;

                        storage.forEach(function(value, key) {
                            if (added) return;

                            if(value.path_with_namespace === project.path_with_namespace) {
                                storage[key] = project;
                                added = true;
                            }
                        });

                        if(added === false && project.path_with_namespace) {
                            storage.push(project);
                        }

                        return project;
                    },

                    members: function (project) {
                        var deferred = $q.defer();

                        $rest.all('projects/' + project.path_with_namespace + '/members')
                            .getList()
                            .then(
                                function (members) {
                                    deferred.resolve(members);
                                },
                                deferred.reject
                            );

                        return deferred.promise;
                    }
                };

            return repository;
        }
    ]);
