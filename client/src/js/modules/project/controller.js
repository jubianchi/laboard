angular.module('laboard-frontend')
    .controller('ProjectController', [
        '$rootScope', '$scope', '$stateParams', '$state', '$modal', 'ColumnsRepository', 'ProjectsRepository', 'IssuesRepository',
        function($root, $scope, $params, $state, $modal, $columns, $projects, $issues) {
            $root.$watch(
                function() {
                    return $root.project;
                },
                function() {
                    if (!$root.project) return;

                    $projects.members($root.project)
                        .then(
                            function(members) {
                                $root.project.members = members;
                            }
                        );

                    $columns.all()
                        .then(
                            function() {
                                $root.project.columns = $columns;
                            }
                        );

                    $issues.all()
                        .then(
                            function() {
                                $root.project.issues = $issues;
                            }
                        );
                }
            );

            if ($params.namespace && $params.project) {
                $projects.one($params.namespace + '/' + $params.project)
                    .then(
                        function (project) {
                            $scope.selectProject(project);
                        }
                    );
            }

            $scope.bootstrap = function() {
                $root.LABOARD_CONFIG.defaultColumns.forEach($columns.persist, $columns);
            };
        }
    ]);
