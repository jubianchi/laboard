angular.module('laboard-frontend')
    .factory('ProjectManager', [
        '$rootScope', '$q', '$http', 'ProjectsRepository', 'ColumnsRepository', 'IssuesRepository',
        function($root, $q, $http, $projects, $columns, $issues) {
            return {
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
