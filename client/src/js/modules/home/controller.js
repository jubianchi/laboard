angular.module('laboard-frontend')
    .controller('HomeController', [
        '$rootScope', '$scope', '$modal', '$state', 'ProjectsRepository', 'ColumnsRepository', 'IssuesRepository',
        function ($root, $scope, $modal, $state, $projects, $columns, $issues) {
            var modal;

            $scope.switchProject = function () {
                var open = function () {
                    modal = $modal
                        .open({
                            templateUrl: 'home/partials/projects.html',
                            backdrop: !!$root.project || 'static',
                            keyboard: !!$root.project,
                            controller: function ($scope) {
                                $scope.selectProject = function (project) {
                                    $projects.one(project.path_with_namespace)
                                        .then(
                                            function (project) {
                                                $root.project = project;
                                                $projects.members(project)
                                                    .then(
                                                        function(members) {
                                                            $root.project.members = members;
                                                        }
                                                    );

                                                if (modal) modal.close($root.project);
                                            }
                                        );
                                };
                            }
                        });

                    modal.result
                        .then(function (project) {
                            if(!project) {
                                open();
                            } else {
                                $columns.clear();
                                $issues.clear();

                                $state.transitionTo(
                                    'project',
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

            $scope.projects = $projects;
            $projects.all();
        }
    ]);
