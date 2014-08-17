angular.module('laboard-frontend')
    .factory('SocketFactory', [
        '$rootScope', 'IssuesRepository',
        function($rootScope, IssuesRepository) {
            $rootScope.socket.on(
                'issue.update',
                function(data) {
                    if (data.namespace + '/' + data.project !== $rootScope.project.path_with_namespace) return;

                    $rootScope.$apply(
                        function() {
                            IssuesRepository.one(data.issue.id)
                                .then(
                                    function(issue) {
                                        $rootScope.$broadcast('issue.update', issue);
                                    }
                                );
                        }
                    );
                }
            );

            return $rootScope.socket;
        }
    ]);
