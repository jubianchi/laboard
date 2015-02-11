angular.module('laboard-frontend')
    .controller('IssueController', [
        '$scope', '$rootScope', 'Restangular', 'ColumnsRepository', '$modal', 'IssuesRepository', 'AuthorizationFactory',
        function($scope, $rootScope, Restangular, ColumnsRepository, $modal, $issues, $authorization) {
            $scope.close = function() {
                $issues.close($scope.issue);
            };

            $scope.unpin = function() {
                $scope.issue.from = $scope.column.title;
                $scope.issue.to = null;

                $issues.move($scope.issue)
            };

            $scope.drag = function() {
                $scope.issue.from = $scope.column;
                $scope.issue.column = null;
            };

            $scope.theme = function(theme) {
                $scope.issue.before = $scope.issue.theme || null;

                if (theme === $scope.issue.before) {
                    theme = null;
                }

                $scope.issue.after = theme;

                $issues.theme($scope.issue).then(null, function() {
                    $scope.issue.theme = $scope.issue.before;
                });
            };

            $scope.star = function(starred) {
                $scope.issue.starred = typeof starred === 'undefined' ? true : !!starred;

                $issues.star($scope.issue).then(null, function() {
                    $scope.issue.starred = !$scope.issue.starred;
                });
            };

            $scope.issue.labels.forEach(function(label, key) {
                if (label.color) {
                    return;
                }

                $scope.issue.labels[key] = {
                    name: label,
                    color: _.find($rootScope.project.labels, { name: label }).color
                };
            });

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

                        $issues.persist($scope.issue);
                    });
            };

            $scope.draggable = $authorization.authorize('developer');
        }
    ]);
