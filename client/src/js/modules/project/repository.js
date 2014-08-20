angular.module('laboard-frontend')
    .factory('ProjectsRepository', [
        '$rootScope', 'Restangular', '$q',
        function($root, $rest, $q) {
            var fetch = function (self) {
                    var deferred = $q.defer();

                    $rest.all('projects')
                        .getList()
                        .then(
                            function (projects) {
                                self.$objects = _.sortBy(projects, 'path_with_namespace');

                                deferred.resolve(projects);
                            },
                            deferred.reject
                        );

                    return deferred.promise;
                },
                fetchOne = function (id, self) {
                    var deferred = $q.defer();

                    $rest.all('projects')
                        .one(id)
                        .get()
                        .then(
                            function (column) {
                                self.add(column);

                                deferred.resolve(column);
                            },
                            deferred.reject
                        );

                    return deferred.promise;
                },
                all = function (self) {
                    var deferred = $q.defer();

                    fetch(self)
                        .then(
                            function(columns) {
                                if (columns.length) {
                                    self.all = function() {
                                        return allCached(self);
                                    };
                                }

                                deferred.resolve(columns);
                            },
                            deferred.reject
                        );

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

                    add: function (project) {
                        var added = false,
                            self = this;

                        this.$objects = this.$objects || [];

                        this.$objects.forEach(function(value, key) {
                            if (added) return;

                            if(value.path_with_namespace === project.path_with_namespace) {
                                self.$objects[key] = project;
                                added = true;
                            }
                        });

                        if(added === false && project.path_with_namespace) {
                            this.$objects.push(project);
                        }

                        return project;
                    },
                    clear: function() {
                        this.$objects = null;

                        this.all = function() {
                            return all(this);
                        };
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
