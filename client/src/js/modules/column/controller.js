angular.module('laboard-frontend')
    .controller('ColumnController', [
        '$rootScope', '$scope', '$modal', '$filter', '$q', 'ColumnsRepository', 'ColumnsSocket', 'IssuesRepository', 'AuthorizationFactory',
        function($root, $scope, $modal, $filter, $q, $columns, $socket, $issues, $authorization) {
            $scope.drop = function(issue) {
                var from = issue.from;
                issue.from = from.title;
                issue.to = $scope.column.title;

                if (
                    ($scope.column.limit > 0 && $scope.column.limit <= $filter('column')($issues.$objects, $scope.column).length) ||
                    (issue.from === issue.to || !issue.to || !issue.from) ||
                    (!from.canGoBackward && $scope.column.position < from.position)
                ) {
                    issue.column = from.title.toLowerCase();

                    return;
                }

                issue.column = $scope.column.title.toLowerCase();

                $issues.move(issue)
                    .then(
                        function (issue) {
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

                if ($scope.column.position < 0) { return; }

                $columns.move($scope.column)
                    .then(
                        function() {
                            $columns.$objects.forEach(function(column) {
                                if (column.title === $scope.column.title) { return; }

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
                    closable = column.closable,
                    limit = column.limit,
                    canGoBackward = column.canGoBackward;

                $modal
                    .open({
                        templateUrl: 'column/partials/modal.html',
                        controller: function($scope, $modalInstance) {
                            $scope.edit = true;
                            $scope.closable = column.closable ? 1 : 0;
                            $scope.title = column.title;
                            $scope.limit = $scope.limit ? ($scope.limit < 0 ? 0 : parseInt($scope.limit, 10)) : 0;
                            $scope.canGoBackward = column.canGoBackward ? 1 : 0;

                            $scope.save = function () {
                                column.closable = $scope.closable == 1;
                                column.limit = $scope.limit;
                                column.canGoBackward = $scope.canGoBackward;

                                $columns.persist(column)
                                    .then(
                                        $modalInstance.close,
                                        function() {
                                            column.closable = closable;
                                            column.limit = limit;
                                            column.canGoBackward = canGoBackward;

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

                if ($scope.column.limit && $scope.column.limit <= $filter('column')($issues.$objects, $scope.column).length) {
                    return;
                }

                $modal
                    .open({
                        templateUrl: 'issue/partials/modal.html',
                        controller: function($scope, $modalInstance) {
                            $issues.uncache().all()
                                .then(
                                    function() {
                                        $issues.$objects.forEach(function(issue) {
                                            if (!issue.column) { issues.push(issue); }
                                        });

                                        $scope.issues = issues;
                                    }
                                );

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
            };

            $scope.droppable = $authorization.authorize('developer');
            $root.$broadcast('column.ready');
        }
    ]);
