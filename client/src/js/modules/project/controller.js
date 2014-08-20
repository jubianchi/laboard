angular.module('laboard-frontend')
    .controller('ProjectController', [
        '$rootScope', '$scope', '$stateParams', '$state', '$modal', 'ColumnsRepository', 'ProjectsRepository', 'IssuesRepository', 'ColumnsSocket',
        function($root, $scope, $params, $state, $modal, $columns, $projects, $issues, $columnsSocket) {
            var load = function() {
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
            };

            if (!$root.project) {
                if ($params.namespace && $params.project) {
                    $projects.one($params.namespace + '/' + $params.project)
                        .then(
                            function (project) {
                                $root.project = project;

                                load();
                            }
                        );
                } else {
                    $state.transitionTo('home');
                }
            } else {
                load();
            }

            $scope.bootstrap = function() {
                $root.LABOARD_CONFIG.defaultColumns.forEach($columns.persist, $columns);
            };
        }
    ]);
