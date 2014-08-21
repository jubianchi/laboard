angular.module('laboard-frontend')
    .controller('HomeController', [
        '$rootScope', '$scope', '$modal', '$state', '$stateParams', 'ProjectsRepository', 'ColumnsRepository', 'IssuesRepository', 'ProjectManager',
        function ($root, $scope, $modal, $state, $params, $projects, $columns, $issues, $projectManager) {
            $scope.switchProject = function () {
                var open = function () {
                    var modal = $modal
                        .open({
                            templateUrl: 'home/partials/projects.html',
                            backdrop: !!$root.project || 'static',
                            keyboard: !!$root.project,
                            controller: function($scope) {
                                $scope.projects = $projects;
                                $scope.selectProject = function (project) {
                                    $projectManager.select(project.path_with_namespace).then(modal.close(project));
                                };
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

            $root.$on('$stateChangeStart', function(e, state) {
                if (state.name === 'home') {
                    $scope.switchProject();
                }
            });

            $scope.projects = $projects;
            $projects.all();

            $root.globalSearch = '';
            $scope.$state = $state;
        }
    ]);
