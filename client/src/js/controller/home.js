angular.module('laboard-frontend')
    .controller('HomeController', [
        '$scope', '$rootScope', 'Restangular', 'ColumnsRepository', '$modal',
        function($scope, $rootScope, Restangular, ColumnsRepository, $modal) {
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

            $rootScope.socket.on(
                'column.new',
                function(data) {
                    if (data.namespace + '/' + data.project !== $rootScope.project.path_with_namespace) return;

                    $rootScope.$apply(
                        function() {
                            ColumnsRepository.all.push(data.column);
                        }
                    );
                }
            );

            $rootScope.socket.on(
                'column.remove',
                function(data) {
                    if (data.namespace + '/' + data.project !== $rootScope.project.path_with_namespace) return;

                    $rootScope.$apply(
                        function() {
                            ColumnsRepository.all.forEach(function(value, key) {
                                if(value.title === data.column.title) {
                                    ColumnsRepository.all.splice(key, 1);
                                }
                            });
                        }
                    );
                }
            );
        }
    ]);
