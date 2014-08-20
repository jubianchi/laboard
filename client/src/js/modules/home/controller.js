angular.module('laboard-frontend')
    .controller('HomeController', [
        '$rootScope', '$scope', '$modal', '$state', '$stateParams', 'ProjectsRepository', 'ColumnsRepository', 'IssuesRepository',
        function ($root, $scope, $modal, $state, $params, $projects, $columns, $issues) {
            var modal;

            var selectProject = $scope.selectProject = function (project) {
                if (!$root.project || project.path_with_namespace !== $root.project.path_with_namespace) {
                    $projects.one(project.path_with_namespace)
                        .then(
                            function (project) {
                                $root.project = project;
                                $columns.clear();
                                $issues.clear();

                                if (modal) modal.close(project);
                            }
                        );
                } else {
                    if (modal) modal.close($root.project);
                }
            };

            $scope.switchProject = function () {
                var open = function () {
                    modal = $modal
                        .open({
                            templateUrl: 'home/partials/projects.html',
                            backdrop: !!$root.project || 'static',
                            keyboard: !!$root.project,
                            controller: function($scope) {
                                $scope.projects = $projects;
                                $scope.selectProject = selectProject;
                            }
                        });

                    modal.result
                        .then(function (project) {
                            if(!project) {
                                open();
                            } else {
                                $state.transitionTo(
                                    'home.project',
                                    {
                                        namespace: project.path_with_namespace.split('/')[0],
                                        project: project.path_with_namespace.split('/')[1]
                                    }
                                );
                            }
                        });
                };

                open();
            };


            $scope.addColumn = function() {
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

            $scope.projects = $projects;
            $projects.all();

            $root.globalSearch = '';
        }
    ]);
