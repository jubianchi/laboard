angular.module('laboard-frontend')
    .controller('HomeController', [
        '$rootScope', '$scope', '$modal', '$state', '$stateParams', 'ProjectsRepository', 'ProjectManager',
        function ($root, $scope, $modal, $state, $params, $projects, $projectManager) {
            $scope.switchProject = function () {
                $projectManager.prompt()
                    .then(
                        function(project) {
                            $state.transitionTo(
                                'home.project',
                                {
                                    namespace: project.path_with_namespace.split('/')[0],
                                    project: project.path_with_namespace.split('/')[1]
                                }
                            );
                        }
                    );
            };

            if ($state.is('home')) {
                $scope.switchProject();
            }

            $scope.$state = $state;
            $scope.projects = $projects;
            $projects.all();
        }
    ]);
