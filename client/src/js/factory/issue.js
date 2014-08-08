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
                        issue.theme = null;
                        issue.labels.forEach(function(label) {
                            if (/^state:/.test(label)) {
                                issue.theme = label.replace(/^state:/, '');
                            }
                        });

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
                        if (!issue.from || !issue.to) return;

                        issue.labels.forEach(function(label, key) {
                            if (label === issue.from.toLowerCase()) {
                                issue.labels.splice(key, 1);
                            }
                        });

                        issue.labels.push(issue.to.toLowerCase());

                        return this.edit(issue);
                    },
                    theme: function(issue, old) {
                        old = 'state:' + (old || 'default');

                        issue.labels.forEach(function(label, key) {
                            if ([old, 'state:' + issue.theme].indexOf(label) > -1) {
                                issue.labels.splice(key, 1);
                            }
                        });

                        if (issue.theme) {
                            issue.labels.push('state:' + issue.theme);
                        }

                        return this.edit(issue);
                    }
                };

            $rootScope.$watch('project', function() {
                repository.all = null;

                if ($rootScope.project) {
                    fetch();
                }
            });

            return repository;
        }
    ]);
