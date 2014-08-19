angular.module('laboard-frontend')
    .controller('IssueController', [
        '$scope', '$rootScope', 'Restangular', 'ColumnsRepository', '$modal', 'IssuesRepository', 'IssuesSocket',
        function($scope, $rootScope, Restangular, ColumnsRepository, $modal, $issues, $socket) {
            var refresh = function(issue) {
                    $scope.issue = issue;
                },
                unpin = function (issue) {
                    $scope.$parent.unpin(issue);
                };

            $scope.close = function() {
                $issues.close($scope.issue).then(unpin);
            };

            $scope.unpin = function() {
                $scope.issue.from = $scope.column.title;
                $scope.issue.to = null;

                $issues.move($scope.issue).then(unpin);
            };

            $scope.drag = function() {
                $scope.issue.from = $scope.column;
                unpin($scope.issue);
            };

            $scope.theme = function(theme) {
                $scope.issue.before = $scope.issue.theme || null;

                if (theme === $scope.issue.before) {
                    theme = null;
                }

                $scope.issue.after = theme;

                $issues.theme($scope.issue)
                    .then(
                        refresh,
                        function() {
                            $scope.issue.theme = $scope.issue.before;
                        }
                    );
            };

            var modal;
            $scope.assign = function() {
                var issue = $scope.issue;

                modal = $modal
                    .open({
                        templateUrl: 'issue/partials/assign.html',
                        controller: function($scope, $modalInstance) {
                            $scope.issue = issue;
                            $scope.assignTo = function(member) {
                                modal.close(member);
                            };
                        }
                    });

                modal.result
                    .then(function(member) {
                        $scope.issue.assignee = member;

                        $issues.persist($scope.issue).then(refresh);
                    });
            };

            $socket
                .on('update', function(data) { refresh(data.issue); })
                .on('theme', function(data) { refresh(data.issue); });
        }
    ]);
