angular.module('laboard-frontend')
    .controller('ProjectController', [
        '$rootScope', '$scope', '$stateParams', '$state', '$modal', 'ColumnsRepository', 'ProjectsRepository', 'IssuesRepository', 'ColumnsSocket',
        function($root, $scope, $params, $state, $modal, $columns, $projects, $issues, $columnsSocket) {
            if (!$root.project) {
                if ($params.namespace && $params.project) {
                    $projects.one($params.namespace + '/' + $params.project)
                        .then(
                            function (project) {
                                $root.project = project;

                                $projects.members(project)
                                    .then(
                                        function(members) {
                                            $root.project.members = members;
                                        }
                                    );

                                $columns.all();
                                $issues.all();
                            }
                        );
                } else {
                    $state.transitionTo('home');
                }
            } else {
                $columns.all();
                $issues.all();
            }

            $scope.bootstrap = function() {
                $root.LABOARD_CONFIG.defaultColumns.forEach($columns.persist, $columns);
            };

            $scope.addColumn = function () {
                $modal
                    .open({
                        templateUrl: 'column/partials/modal.html',
                        controller: function ($scope, $modalInstance) {
                            $scope.theme = 'default';
                            $scope.error = false;

                            $scope.save = function () {
                                var column = {
                                    title: $scope.title,
                                    theme: $scope.theme,
                                    position: $columns.$objects.length
                                };

                                $columns.persist(column)
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

            $scope.$watch(
                function () {
                    return $columns.$objects;
                },
                function (data) {
                    if (typeof data.length !== 'undefined') $scope.columns = data;
                }
            );

            $columnsSocket.on('move', function() {});
        }
    ]);
