angular.module('laboard-frontend')
    .controller('IssueController', [
        '$scope', '$rootScope', 'Restangular', 'ColumnsRepository', '$modal', '$compile', '$http', 'IssuesRepository',
        function($scope, $rootScope, Restangular, ColumnsRepository, $modal, $compile, $http, IssuesRepository) {
            $scope.drag = function(column) {
                var key = column.issues.indexOf($scope.issue);
                $scope.issue.from = column.title;

                if (key > -1) {
                    column.issues.splice(key, 1);
                }
            };

            $scope.theme = function(theme) {
                $scope.issue.before = $scope.issue.theme || null;

                if (theme === $scope.issue.before) {
                    theme = null;
                }

                $scope.issue.after = theme;

                IssuesRepository.theme($scope.issue)
                    .then(
                        function() {},
                        function() {
                            $scope.issue.theme = $scope.issue.before;
                        }
                    );
            };

            $rootScope.socket.on(
                'issue.theme',
                function(data) {
                    if (data.issue.id !== $scope.issue.id) return;

                    $rootScope.$apply(
                        function() {
                            IssuesRepository.add(data.issue);
                        }
                    );
                }
            );
        }
    ]);
