angular.module('laboard-frontend')
    .controller('HomeController', [
        '$scope', '$rootScope', 'Restangular', 'ColumnsRepository', '$modal', '$compile', '$http', 'IssuesRepository',
        function($scope, $rootScope, Restangular, ColumnsRepository, $modal, $compile, $http, IssuesRepository) {
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
        }
    ]);
