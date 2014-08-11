angular.module('laboard-frontend')
    .controller('IssueController', [
        '$scope', '$rootScope', 'Restangular', 'ColumnsRepository', '$modal', '$compile', '$http', 'IssuesRepository',
        function($scope, $rootScope, Restangular, ColumnsRepository, $modal, $compile, $http, IssuesRepository) {
            $scope.drag = function(column) {
                $scope.issue.from = column;
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
                    if (data.namespace + '/' + data.project !== $rootScope.project.path_with_namespace) return;
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
