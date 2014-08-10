angular.module('laboard-frontend')
    .factory('ColumnsRepository', [
        '$rootScope', 'Restangular', '$q',
        function($rootScope, Restangular, $q) {
            var fetch = function() {
                    Restangular.all('projects/' + $rootScope.project.path_with_namespace + '/columns').getList()
                        .then(
                            function (columns) {
                                repository.all = _.sortBy(columns, 'position');
                            }
                        );
                },
                repository = {
                    all: null,
                    add: function(column) {
                        var self = this,
                            added = false,
                            deferred = $q.defer();

                        if(!self.all) {
                            self.all = [];
                        }

                        column.position = column.position || this.all.length;
                        column.theme = column.theme || 'default';

                        Restangular.all('projects/' + $rootScope.project.path_with_namespace + '/columns').post(column)
                            .then(
                                function(column) {
                                    self.all.forEach(function(value, key) {
                                        if(value.title === column.title) {
                                            self.all[key] = column;
                                            added = true;
                                        }
                                    });

                                    if(added === false && column.title) {
                                        self.all.push(column);
                                    }

                                    deferred.resolve(column);
                                },
                                function(err) {
                                    deferred.reject(err);
                                }
                            );

                        return deferred.promise;
                    },
                    edit: function(column) {
                        var deferred = $q.defer();

                        column.put()
                            .then(
                                function(column) {
                                    deferred.resolve(column);
                                },
                                function(err) {
                                    deferred.reject(err);
                                }
                            );

                        return deferred.promise;
                    },
                    move: function(column) {
                        var deferred = $q.defer();

                        column.id = column.title;

                        column.customPUT(column, 'move')
                            .then(
                            function(column) {
                                deferred.resolve(column);
                            },
                            function(err) {
                                deferred.reject(err);
                            }
                        );

                        return deferred.promise;
                    },
                    remove: function(column) {
                        var self = this,
                            deferred = $q.defer();

                        column.remove({}, {'Content-Type': 'application/json'})
                            .then(
                                function(column) {
                                    self.all.forEach(function(value, key) {
                                        if(value.title === column.title) {
                                            self.all.splice(key, 1);
                                        }
                                    });

                                    deferred.resolve(column);
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
