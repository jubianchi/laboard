angular.module('laboard-frontend')
    .controller('IssueController', [
        '$scope', '$rootScope', 'Restangular', 'ColumnsRepository', '$modal', '$compile', '$http', 'IssuesRepository', 'SocketFactory',
        function($scope, $rootScope, Restangular, ColumnsRepository, $modal, $compile, $http, IssuesRepository, SocketFactory) {
            $scope.drag = function(column) {
                $scope.issue.from = column;

                var key = column.issues.indexOf($scope.issue);
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

            var modal;
            $scope.assign = function() {
                var issue = $scope.issue;

                modal = $modal
                    .open({
                        templateUrl: 'partials/issue/assign.html',
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

                        IssuesRepository.edit($scope.issue);
                    });
            };

            SocketFactory.on(
                'issue.theme',
                function (data) {
                    console.log(data.namespace + '/' + data.project, $rootScope.project.path_with_namespace);

                    if (data.namespace + '/' + data.project !== $rootScope.project.path_with_namespace) return;

                    console.log(data.issue.id, $scope.issue.id);

                    if (data.issue.id !== $scope.issue.id) return;


                    console.log('handling');

                    $rootScope.$apply(
                        function () {
                            IssuesRepository.add(data.issue);
                        }
                    );
                }
            );
        }
    ]);
