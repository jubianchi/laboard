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
                    one: function(id) {
                        var self = this;

                        return Restangular.one('projects/' + $rootScope.project.path_with_namespace + '/issues/' + id).get()
                            .then(function(issue) {
                                return self.add(issue);
                            });
                    },
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

                        return issue;
                    },
                    edit: function(issue) {
                        var self = this,
                            deferred = $q.defer();

                        self.all.forEach(function(value, key) {
                            if(value.id === issue.id) {
                                issue = _.assign(self.all[key], issue);
                            }
                        });

                        issue.assignee_id = issue.assignee.id;

                        Restangular
                            .one('projects/' + $rootScope.project.path_with_namespace)
                            .one('issues', issue.iid).customPUT(issue)
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

                        Restangular
                            .one('projects/' + $rootScope.project.path_with_namespace)
                            .one('issues', issue.iid).customPUT(issue, 'move')
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

                        Restangular
                            .one('projects/' + $rootScope.project.path_with_namespace)
                            .one('issues', issue.iid).customPUT(issue, 'theme')
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
                    close: function(issue) {
                        var self = this,
                            deferred = $q.defer();

                        Restangular
                            .one('projects/' + $rootScope.project.path_with_namespace)
                            .one('issues', issue.iid).customPUT(issue, 'close')
                            .then(
                                function(issue) {
                                    self.all.forEach(function(value, key) {
                                        if(value.id === issue.id) {
                                            delete self.all[key];
                                        }
                                    });

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
