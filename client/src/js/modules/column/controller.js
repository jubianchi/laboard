angular.module('laboard-frontend')
    .controller('ColumnController', [
        '$rootScope', '$scope', '$modal', '$filter', 'ColumnsRepository', 'ColumnsSocket', 'IssuesRepository',
        function($root, $scope, $modal, $filter, $columns, $socket, $issues) {
            $scope.drop = function(issue) {
                var from = issue.from;
                issue.from = from.title;
                issue.to = $scope.column.title;
                issue.column = $scope.column.title.toLowerCase();

                if (issue.from === issue.to) {
                    $scope.column.issues.push(issue);
                }

                if (issue.from === issue.to || !issue.to || !issue.from) return;

                $issues.move(issue)
                    .then(
                        function(issue) {
                            if (issue.theme) {
                                issue.before = issue.theme;
                                issue.after = null;
                                $issues.theme(issue);
                            }
                        }
                    );
            };

            $scope.move = function(step) {
                $scope.column.position += step;

                $columns.move($scope.column)
                    .then(
                        function() {
                            $columns.$objects.forEach(function(column) {
                                if(column.title === $scope.column.title) return;

                                if (column.position === $scope.column.position) {
                                    column.position += -step;

                                    $columns.move(column)
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
                    theme = column.theme,
                    closable = column.closable;

                $modal
                    .open({
                        templateUrl: 'column/partials/modal.html',
                        controller: function($scope, $modalInstance) {
                            $scope.edit = true;
                            $scope.closable = column.closable ? 1 : 0;
                            $scope.theme = column.theme || 'default';
                            $scope.title = column.title;

                            $scope.save = function () {
                                column.theme = $scope.theme;
                                column.closable = $scope.closable == 1;

                                $columns.persist(column)
                                    .then(
                                        $modalInstance.close,
                                        function() {
                                            column.theme = theme;
                                            column.closable = closable;

                                            $modalInstance.dismiss('error');
                                        }
                                    );
                            };
                        }
                    });
            };

            $scope.remove = function () {
                $columns.remove($scope.column)
                    .then(function () {
                        $issues.$objects.forEach(function(issue) {
                            if (issue.column === $scope.column.title.toLowerCase()) {
                                issue.from = $scope.column.title;
                                issue.to = null;

                                $issues.move(issue);
                            }
                        });
                    });
            };

            $scope.pin = function() {
                var issues = [],
                    column = $scope.column;

                $issues.$objects.forEach(function(issue) {
                    if (!issue.column) issues.push(issue);
                });

                if (issues.length) {
                    $modal
                        .open({
                            templateUrl: 'issue/partials/modal.html',
                            controller: function($scope, $modalInstance) {
                                $scope.issues = issues;
                                $scope.import = function(issue) {
                                    issue.from = null;
                                    issue.to = column.title;

                                    $issues.move(issue)
                                        .then(
                                            function() {
                                                var index = issues.indexOf(issue);

                                                if (index > -1) {
                                                    $scope.issues.splice(index, 1);
                                                }

                                                if ($scope.issues.length === 0) {
                                                    $modalInstance.close();
                                                }
                                            }
                                        );
                                }
                            }
                        });
                }
            };
        }
    ]);
