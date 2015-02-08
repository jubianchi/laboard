angular.module('laboard-frontend')
    .factory('IssuesRepository', [
        '$rootScope', 'Restangular', '$q', 'IssuesSocket',
        function($root, $rest, $q, $socket) {
            var fetch = function(self) {
                    var deferred = $q.defer();

                    $rest.all('projects/' + $root.project.path_with_namespace + '/issues')
                        .getList()
                        .then(
                            function (issues) {
                                self.$objects = _.sortBy(issues, 'iid');

                                deferred.resolve(issues);
                            },
                            deferred.reject
                        );

                    return deferred.promise;
                },
                fetchOne = function (id, self) {
                    var deferred = $q.defer();

                    $rest.all('projects/' + $root.project.path_with_namespace)
                        .one('issues', id)
                        .get()
                        .then(
                            function (issue) {
                                deferred.resolve(self.add(issue));
                            },
                            deferred.reject
                        );

                    return deferred.promise;
                },
                all = function (self) {
                    var deferred = $q.defer();

                    if (!$root.project) {
                        deferred.reject();
                    } else {
                        fetch(self)
                            .then(
                                function(issues) {
                                    if (issues.length) {
                                        self.all = function() {
                                            return allCached(self);
                                        };
                                    }

                                    deferred.resolve(issues);
                                },
                                deferred.reject
                            );
                    }

                    return deferred.promise;
                },
                allCached = function(self) {
                    var deferred = $q.defer();

                    deferred.resolve(self.$objects);

                    return deferred.promise;
                },
                repository = {
                    $objects: null,

                    all: function() {
                        return all(this);
                    },
                    one: function(id) {
                        return fetchOne(id, this);
                    },

                    add: function(issue) {
                        var added = false,
                            self = this;

                        this.$objects = this.$objects || [];

                        this.$objects.forEach(function(value, key) {
                            if (added) { return; }

                            if (value.id === issue.id) {
                                self.$objects[key] = issue;
                                added = true;
                            }
                        });

                        if (added === false && issue.id) {
                            this.$objects.push(issue);
                        }

                        return issue;
                    },
                    unadd: function (issue) {
                        var self = this;

                        this.$objects.forEach(function(value, key) {
                            if (value.id === issue.id) {
                                self.$objects.splice(key, 1);
                            }
                        });

                        return issue;
                    },
                    clear: function() {
                        this.$objects = null;

                        return this.uncache();
                    },
                    uncache: function() {
                        this.all = function() {
                            return all(this);
                        };

                        return this;
                    },

                    persist: function (issue) {
                        var self = this,
                            deferred = $q.defer();

                        if (issue.assignee) {
                            issue.assignee_id = issue.assignee.id;
                        }

                        $rest.all('projects/' + $root.project.path_with_namespace)
                            .one('issues', issue.iid)
                            .customPUT(issue)
                            .then(
                                function(issue) {
                                    self.add(issue);

                                    deferred.resolve(issue);
                                },
                                deferred.reject
                            );

                        return deferred.promise;
                    },
                    move: function(issue) {
                        var self = this,
                            deferred = $q.defer();

                        $rest.all('projects/' + $root.project.path_with_namespace)
                            .one('issues', issue.iid)
                            .customPUT(issue, 'move')
                            .then(
                                function(issue) {
                                    deferred.resolve(self.add(issue));
                                },
                                deferred.reject
                            );

                        return deferred.promise;
                    },
                    theme: function(issue) {
                        var self = this,
                            deferred = $q.defer();

                        $rest.all('projects/' + $root.project.path_with_namespace)
                            .one('issues', issue.iid)
                            .customPUT(issue, 'theme')
                            .then(
                                function(issue) {
                                    deferred.resolve(self.add(issue));
                                },
                                function(err) {
                                    deferred.reject(err);
                                }
                            );

                        return deferred.promise;
                    },
                    star: function(issue) {
                        var self = this,
                            deferred = $q.defer();

                        $rest.all('projects/' + $root.project.path_with_namespace)
                            .one('issues', issue.iid)
                            .customPUT(issue, 'star')
                            .then(
                                function(issue) {
                                    if (issue.state === 'closed') {
                                        self.unadd(issue);
                                    } else {
                                        self.add(issue);
                                    }

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

                        $rest.all('projects/' + $root.project.path_with_namespace)
                            .one('issues', issue.iid)
                            .customPUT(issue, 'close')
                            .then(
                                function(issue) {
                                    if (!issue.starred) {
                                        self.unadd(issue)
                                    }

                                    deferred.resolve(issue);
                                },
                                function(err) {
                                    deferred.reject(err);
                                }
                            );

                        return deferred.promise;
                    }
                };

            var handler = function(data) {
                repository.one(data.issue.id).then(function(issue) {
                    if (issue.state === 'closed' && issue.starred === false) {
                        repository.unadd(issue);
                    }
                });
            };

            $socket
                .on('update', handler)
                .on('move', handler)
                .on('theme', handler)
                .on('star', handler)
                .on('edit', handler)
                .on('close', handler);

            return repository;
        }
    ]);
