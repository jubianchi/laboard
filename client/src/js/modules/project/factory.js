angular.module('laboard-frontend')
    .factory('ProjectManager', [
        '$rootScope', '$q', '$modal', 'ProjectsRepository', 'ColumnsRepository', 'IssuesRepository',
        function($root, $q, $modal, $projects, $columns, $issues) {
            var open = function () {
                    var modal = $modal.open({
                            templateUrl: 'home/partials/projects.html',
                            backdrop: !!$root.project || 'static',
                            keyboard: !!$root.project,
                            controller: function($scope) {
                                $scope.projects = $projects;
                                $scope.selectProject = function (project) {
                                    modal.close(project);
                                };
                            }
                        });

                    return modal.result;
                };

            return {
                prompt: function() {
                    return open().then(this.select);
                },

                select: function(project) {
                    var deferred = $q.defer();

                    if (typeof project === 'object') {
                        project = project.path_with_namespace;
                    }

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
