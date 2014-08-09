angular.module('laboard-frontend')
    .factory('IssuesRepository', [
        '$rootScope', 'Restangular', '$q',
        function($rootScope, Restangular, $q) {
            var fetch = function() {
                    Restangular.all('projects/' + $rootScope.project.path_with_namespace + '/issues').getList()
                        .then(
                            function (issues) {
                                repository.all = [];

                                _.sortBy(issues, 'iid').forEach(function(issue) {
                                    repository.add(issue);
                                });
                            }
                        );
                },
                repository = {
                    all: null,
                    add: function(issue) {
                        var self = this,
                            added = false;

                        if(!self.all) {
                            self.all = [];
                        }

                        self.all.forEach(function(value, key) {
                            if(value.id === issue.id) {
                                self.all[key] = _.assign(self.all[key], issue);
                                added = true;
                            }
                        });

                        if(added === false && issue.id) {
                            self.all.push(issue);
                        }
                    },
                    edit: function(issue) {
                        var self = this,
                            deferred = $q.defer();

                        self.all.forEach(function(value, key) {
                            if(value.id === issue.id) {
                                issue = _.assign(self.all[key], issue);
                            }
                        });

                        issue.put()
                            .then(
                                function(issue) {
                                    self.add(issue);

                                    deferred.resolve(issue);
                                },
                                function(err) {
                                    deferred.reject(err);
                                }
                            );

                        return deferred.promise;
                    },
                    move: function(issue) {
                        var self = this,
                            deferred = $q.defer();

                        issue.customPUT(issue, 'move')
                            .then(
                                function(issue) {
                                    self.add(issue);

                                    deferred.resolve(issue);
                                },
                                function(err) {
                                    deferred.reject(err);
                                }
                            );

                        return deferred.promise;
                    },
                    theme: function(issue) {
                        var self = this,
                            deferred = $q.defer();

                        issue.customPUT(issue, 'theme')
                            .then(
                                function(issue) {
                                    self.add(issue);

                                    deferred.resolve(issue);
                                },
                                function(err) {
                                    deferred.reject(err);
                                }
                            );

                        return deferred.promise;
                    }
                };

            $rootScope.$watch('project', function() {
                if ($rootScope.project) {
                    fetch();
                }
            });

            return repository;
        }
    ]);
