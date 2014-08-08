angular.module('laboard-frontend')
    .controller('HomeController', [
        '$scope', '$rootScope', 'Restangular', 'ColumnsRepository', '$modal', '$compile', '$http', 'IssuesRepository',
        function($scope, $rootScope, Restangular, ColumnsRepository, $modal, $compile, $http, IssuesRepository) {
            $scope.drop = function(column, data, index, evt) {
                column.issues.push(data);
                data.to = column.title;

                IssuesRepository.move(data).then(function(issue) {
                    var old = issue.theme;

                    issue.theme = null;
                    $scope.theme(issue, old);
                });
            };

            $scope.drag = function(column, data, index, evt) {
                var key = column.issues.indexOf(data);
                data.from = column.title;

                if (key > -1) {
                    column.issues.splice(key, 1);
                }
            };

            $scope.theme = function(issue, state) {
                var old = issue.theme;

                if (issue.theme === state) {
                    issue.theme = null;
                } else {
                    issue.theme = state;
                }

                IssuesRepository.theme(issue, old);
            };

            $scope.move = function(column, step) {
                column.position += step;

                ColumnsRepository.edit(column)
                    .then(
                        function() {
                            $scope.columns.all.forEach(function(col) {
                                if(col === column) return;

                                if (col.position === column.position) {
                                    col.position += -step;

                                    ColumnsRepository.edit(col)
                                        .then(
                                            function() {
                                                console.log('moved ' + col.title + ' to ' + col.position + '(' + -step + ')');
                                            },
                                            function() {
                                                column.position += -step;
                                                col.position += step;
                                            }
                                        );
                                }
                            });
                        },
                        function() {
                            column.position += -step;
                        }
                    );
            };

            $scope.edit = function(column) {
                var theme = column.theme;

                $modal
                    .open({
                        templateUrl: 'partials/column/modal.html',
                        controller: function($scope, $modalInstance) {
                            $scope.edit = true;
                            $scope.theme = column.theme || 'default';

                            $scope.save = function () {
                                column.theme = $scope.theme;

                                ColumnsRepository.edit(column)
                                    .then(
                                        $modalInstance.close,
                                        function() {
                                            column.theme = theme;

                                            $modalInstance.dismiss('error');
                                        }
                                    );
                            };
                        }
                    });
            };

            $scope.remove = function(column) {
                ColumnsRepository.remove(column);
            };

            $scope.create = function() {
                $modal
                    .open({
                        templateUrl: 'partials/column/modal.html',
                        controller: function ($scope, $modalInstance) {
                            $scope.theme = 'default';
                            $scope.error = false;

                            $scope.save = function () {
                                var column = {
                                    title: $scope.title,
                                    theme: $scope.theme
                                };

                                ColumnsRepository.add(column)
                                    .then(
                                        $modalInstance.close,
                                        function () {
                                            $scope.error = true;
                                        }
                                    );
                            };
                        }
                    });
            };

            $scope.bootstrap = function() {
                ['Sandbox', 'Backlog', 'Accepted', 'Review', 'Done'].forEach(function(column, index) {
                    column = {
                        title: column,
                        position: index,
                        issues: []
                    };

                    ColumnsRepository.add(column);
                });
            };

            $scope.columns = ColumnsRepository;

            $scope.fillColumns = function(column) {
                if (IssuesRepository.all) {
                    var issues = [];

                    IssuesRepository.all.forEach(function(issue) {
                        if (issue.labels.indexOf(column.title.toLowerCase()) > -1) {
                            if (!column.issues) column.issues = [];

                            issues.push(issue);
                        }
                    });

                    column.issues = issues;
                }
            };

            $scope.$watch(
                function() {
                    return $scope.columns.all;
                },
                function() {
                    if ($scope.columns.all) {
                        $scope.columns.all.forEach(function(column) {
                            if (IssuesRepository.all) {
                                $scope.fillColumns(column);
                            } else {
                                $scope.$watch(
                                    function() {
                                        return IssuesRepository.all;
                                    },
                                    function() {
                                        $scope.fillColumns(column);
                                    }
                                )
                            }
                        });
                    }
                }
            );

            $http.get('partials/issue/members.html')
                .success(function(data) {
                    $rootScope.members = $compile(data);
                });

            socket.on('issue', function(data) {
                if ($rootScope.project.path_with_namespace === data.namespace + '/' + data.project) {
                    $rootScope.$apply(function() {
                        IssuesRepository.add(data.issue);

                        $scope.columns.all.forEach(function(column) {
                           $scope.fillColumns(column);
                        });
                    });
                }
            });
        }
    ]);
