angular.module('laboard-frontend')
    .factory('ColumnsRepository', [
        '$rootScope', 'Restangular', '$q', 'ColumnsSocket',
        function($root, $rest, $q, $socket) {
            var fetch = function (self) {
                    var deferred = $q.defer();

                    $rest.all('projects/' + $root.project.path_with_namespace + '/columns')
                        .getList()
                        .then(
                            function (columns) {
                                self.$objects = _.sortBy(columns, 'position');

                                deferred.resolve(columns);
                            },
                            deferred.reject
                        );

                    return deferred.promise;
                },
                fetchOne = function (id, self) {
                    var deferred = $q.defer();

                    $rest.all('projects/' + $root.project.path_with_namespace + '/columns')
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

                    if (!$root.project) {
                        deferred.reject();
                    } else {
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

                    add: function(column) {
                        var added = false,
                            self = this;

                        column.position = column.position || this.all.length;
                        column.theme = column.theme || 'default';
                        column.closable = column.closable == true;
                        column.issues = column.issues || [];

                        this.$objects = this.$objects || [];

                        this.$objects.forEach(function(value, key) {
                            if (added) { return; }

                            if (value.title === column.title) {
                                self.$objects[key] = column;
                                added = true;
                            }
                        });

                        if (added === false && column.title) {
                            this.$objects.push(column);
                        }

                        return column;
                    },
                    unadd: function (column) {
                        var self = this;

                        this.$objects.forEach(function(value, key) {
                            if (value.title === column.title) {
                                self.$objects.splice(key, 1);
                            }
                        });

                        return column;
                    },
                    clear: function() {
                        this.$objects = null;

                        this.all = function() {
                            return all(this);
                        };
                    },

                    persist: function (column) {
                        var self = this,
                            deferred = $q.defer(),
                            project = $root.project.path_with_namespace;

                        $rest.all('projects/' + project + '/columns')
                            .post(column)
                            .then(
                                function (column) {
                                    self.add(column);

                                    deferred.resolve(column);
                                },
                                function() {
                                    $rest.all('projects/' + project + '/columns')
                                        .one(column.title)
                                        .customPUT(column)
                                        .then(
                                            function(column) {
                                                self.add(column);

                                                deferred.resolve(column);
                                            },
                                            deferred.reject
                                        );
                                }
                            );

                        return deferred.promise;
                    },
                    remove: function(column) {
                        var deferred = $q.defer(),
                            self = this;

                        $rest.all('projects/' + $root.project.path_with_namespace + '/columns')
                            .one(column.title)
                            .remove()
                            .then(
                                function(column) {
                                    deferred.resolve(self.unadd(column));
                                },
                                deferred.reject
                            );

                        return deferred.promise;
                    },
                    move: function(column) {
                        var self = this,
                            deferred = $q.defer();

                        $rest.all('projects/' + $root.project.path_with_namespace + '/columns')
                            .one(column.title)
                            .customPUT(column, 'move')
                            .then(
                                function(column) {
                                    self.add(column);

                                    deferred.resolve(column);
                                },
                                deferred.reject
                            );

                        return deferred.promise;
                    }
                };

            var handler = function(data) {
                repository.add(data.column);
            };

            $socket
                .on('new', handler)
                .on('move', handler)
                .on('edit', handler)
                .on('remove',
                    function(data) {
                        repository.unadd(data.column);
                    }
                );

            return repository;
        }
    ]);
