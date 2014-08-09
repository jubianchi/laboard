angular.module('laboard-frontend')
    .controller('ColumnController', [
        '$scope', '$rootScope', 'ColumnsRepository', '$modal', 'IssuesRepository',
        function($scope, $rootScope, ColumnsRepository, $modal, IssuesRepository) {
            $scope.drop = function(issue) {
                $scope.column.issues.push(issue);
                issue.to = $scope.column.title;

                IssuesRepository.move(issue)
                    .then(
                        function(issue) {
                            if (issue.theme) {
                                issue.before = issue.theme;
                                issue.after = null;

                                IssuesRepository.theme(issue);
                            }
                        }
                    );
            };

            $scope.move = function(step) {
                $scope.column.position += step;

                ColumnsRepository.edit($scope.column)
                    .then(
                        function() {
                            $scope.columns.all.forEach(function(column) {
                                if(column === $scope.column) return;

                                if (column.position === $scope.column.position) {
                                    column.position += -step;

                                    ColumnsRepository.edit(column)
                                        .then(
                                            function() {},
                                            function() {
                                                $scope.column.position += -step;
                                                column.position += step;
                                            }
                                        );
                                }
                            });
                        },
                        function() {
                            $scope.column.position += -step;
                        }
                    );
            };

            $scope.edit = function() {
                var column = $scope.column,
                    theme = $scope.column.theme;

                $modal
                    .open({
                        templateUrl: 'partials/column/modal.html',
                        controller: function($scope, $modalInstance) {
                            $scope.edit = true;
                            $scope.closable = column.closable || false;
                            $scope.theme = column.theme || 'default';
                            $scope.title = column.title;

                            $scope.save = function () {
                                column.theme = $scope.theme;
                                column.closable = $scope.closable;

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

            $scope.remove = function() {
                ColumnsRepository.remove($scope.column);
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

            $scope.fill = function() {
                var issues = [];

                IssuesRepository.all.forEach(function(issue) {
                    if (issue.column === $scope.column.title.toLowerCase()) {
                        issues.push(issue);
                    }
                });

                $scope.column.issues = issues;
            };

            $scope.import = function() {
                var issues = [],
                    column = $scope.column;

                IssuesRepository.all.forEach(function(issue) {
                    if (!issue.column) issues.push(issue);
                });

                if (issues.length) {
                    $modal
                        .open({
                            templateUrl: 'partials/issue/modal.html',
                            controller: function($scope, $modalInstance) {
                                $scope.issues = issues;
                                $scope.import = function(issue) {
                                    if (!column.issues) column.issues = [];
                                    if (!issue.labels) issue.labels = [];

                                    issue.labels.push('column:' + column.title.toLowerCase());
                                    IssuesRepository.edit(issue)
                                        .then(function() {
                                            var index = issues.indexOf(issue);

                                            if (index > -1) {
                                                issues.splice(index, 1);
                                            }

                                            column.issues.push(issue);

                                            if (issues.length === 0) {
                                                $modalInstance.close();
                                            }
                                        });
                                }
                            }
                        });
                }
            };

            $scope.close = function(issue) {
                IssuesRepository.close(issue)
                    .then(function() {
                        var key = $scope.column.issues.indexOf(issue);

                        if (key > -1) {
                            $scope.column.issues.splice(key, 1);
                        }
                    });
            };

            $scope.$watch(
                function() {
                    return IssuesRepository.all;
                },
                function() {
                    if (IssuesRepository.all) {
                        $scope.fill();
                    }
                }
            );

            socket.on(
                'issue.move',
                function(data) {
                    var index = [data.from, data.to].indexOf($scope.column.title.toLowerCase());

                    if (index === -1) return;

                    $rootScope.$apply(
                        function() {
                            IssuesRepository.add(data.issue);

                            $scope.fill();
                        }
                    );
                }
            );
        }
    ]);
