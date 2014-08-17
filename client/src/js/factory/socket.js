angular.module('laboard-frontend')
    .factory('SocketFactory', [
        '$rootScope', 'IssuesRepository',
        function($rootScope, IssuesRepository) {
            var handler = function(data) {
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
            };

            $rootScope.socket.on('issue.update', handler);
            $rootScope.socket.on('issue.edit', handler);

            return $rootScope.socket;
        }
    ]);
