var addColumn = function($modal, $columns) {
    return function() {
        $modal
            .open({
                templateUrl: 'column/partials/modal.html',
                controller: function ($scope, $modalInstance) {
                    $scope.closable = false;
                    $scope.canGoBackward = false;
                    $scope.error = false;

                    $scope.save = function () {
                        var column = {
                            title: $scope.title,
                            position: $columns.$objects.length,
                            limit: $scope.limit ? ($scope.limit < 0 ? 0 : parseInt($scope.limit, 10)) : 0
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
};

angular.module('laboard-frontend')
    .controller('ProjectController', [
        '$rootScope', '$scope', '$stateParams', '$state', '$modal', 'ColumnsRepository', 'ProjectsRepository', 'IssuesRepository', 'ProjectManager',
        function($root, $scope, $params, $state, $modal, $columns, $projects, $issues, $projectManager) {
            var render = function() {
                $projects.members($root.project)
                    .then(
                        function(members) {
                            $root.project.members = members;
                        }
                    );

                $root.project.labels = $projects.labels($root.project);

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

            if ($params.namespace && $params.project) {
                $projectManager.select($params.namespace + '/' + $params.project)
                    .then(
                        render,
                        function() {
                            $state.go('home');
                        }
                    );
            } else {
                render();
            }

            $scope.addColumn = addColumn($modal, $columns);

            $scope.bootstrap = function() {
                $root.LABOARD_CONFIG.defaultColumns.forEach($columns.persist, $columns);
            };

            if ($params.query) {
                $root.globalSearch = $params.query;
            }
        }
    ])
    .controller('ProjectMenuController', [
        '$rootScope', '$scope', '$modal', 'ColumnsRepository',
        function ($root, $scope, $modal, $columns) {
            $scope.addColumn = addColumn($modal, $columns);
        }
    ]);
