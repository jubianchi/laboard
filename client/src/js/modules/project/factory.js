angular.module('laboard-frontend')
    .factory('ProjectManager', [
        '$rootScope', '$q', '$modal', 'ProjectsRepository', 'ColumnsRepository', 'IssuesRepository',
        function($root, $q, $modal, $projects, $columns, $issues) {
            var open = function (select) {
                    var deferred = $q.defer(),
                        modal = $modal
                        .open({
                            templateUrl: 'home/partials/projects.html',
                            backdrop: !!$root.project || 'static',
                            keyboard: !!$root.project,
                            controller: function($scope) {
                                $scope.projects = $projects;
                                $scope.selectProject = function (project) {
                                    select(project.path_with_namespace).then(modal.close(project));
                                };
                            }
                        });

                    modal.result
                        .then(
                            function (project) {
                                if (!project) {
                                    open();
                                } else {
                                    deferred.resolve(project);
                                }
                            },
                            deferred.reject()
                        );

                    return deferred.promise;
                };

            return {
                prompt: function() {
                    return open(this.select);
                },

                select: function(project) {
                    var deferred = $q.defer();

                    if (!$root.project || project !== $root.project.path_with_namespace) {
                        $projects.one(project)
                            .then(
                                function (project) {
                                    $root.project = project;
                                    $columns.clear();
                                    $issues.clear();

                                    $root.$broadcast('project.select');

                                    deferred.resolve(project);
                                },
                                deferred.reject
                            );
                    } else {
                        if ($root.project) {
                            deferred.resolve($root.project);
                        } else {
                            deferred.reject();
                        }
                    }

                    return deferred.promise;
                }
            };
        }
    ]);
