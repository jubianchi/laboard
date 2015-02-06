angular.module('laboard-frontend')
    .controller('HomeController', [
        '$rootScope', '$scope', '$state', 'ProjectsRepository', 'ProjectManager',
        function ($root, $scope, $state, $projects, $projectManager) {
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

angular.module('laboard-frontend')
    .controller('SearchController', [
        '$rootScope', '$scope',
        function ($root, $scope) {
            $scope.items = [];
            $scope.showDropdown = false;

            $scope.searchFor = function($event, query) {
                if ($root.globalSearch.match(/^@[^\s]*$/)) {
                    var regex = new RegExp('^' + $root.globalSearch.replace(/^@/, ''));

                    if (query.match(/^@/)) {
                        regex = new RegExp('^' + $root.globalSearch);
                    }

                    query = query.replace(regex, '');
                } else {
                    $root.globalSearch = $root.globalSearch.replace(/^(.*?)[^\s]*$/, '$1');

                    if ($root.globalSearch && !$root.globalSearch.match(/\s$/)) {
                        $root.globalSearch += ' ';
                    }
                }

                $root.globalSearch = $root.globalSearch + query;
            };

            $root.$watch(
                function() {
                    return $root.globalSearch;
                },
                function(value) {
                    if (value === undefined) {
                        return;
                    }

                    $scope.items = [];

                    if (value == '') {
                        $scope.items = $scope.items.concat([
                            {
                                icon: 'fa-slack',
                                label: 'Search issue numbers',
                                value: '#'
                            },
                            {
                                icon: 'fa-crosshairs',
                                label: 'Search milestones (semver)',
                                value: ':'
                            }
                        ].filter(function(item) {
                            return item.value.match(value);
                        }));
                    }

                    if (value == '' || (value[0] === '@' && !value.match(/^@(?:from|to|me)$/))) {
                        $scope.items = $scope.items.concat([
                            {
                                icon: 'fa-users',
                                label: 'Search authors',
                                value: '@from '
                            },
                            {
                                icon: 'fa-users',
                                label: 'Search assignees',
                                value: '@to '
                            },
                            {
                                icon: 'fa-users',
                                label: 'Search assignees and authors',
                                value: '@'
                            },
                            {
                                icon: 'fa-user',
                                label: 'Search my issues (authored and assigned)',
                                value: '@me'
                            }
                        ].filter(function(item) {
                            return item.value.match(value);
                        }));
                    }

                    if (value[0] === '@') {
                        $scope.items = $scope.items.concat(
                            $root.project.members.map(function(member) {
                                return {
                                    icon: 'fa-user',
                                    label: member.username,
                                    sub: member.name,
                                    value: member.username
                                }
                            }).filter(function(member) {
                                return member.value.match(value.replace(/^@(?:from|to)? ?/, ''));
                            })
                        );
                    }

                    $scope.showDropdown = $scope.items.length > 0;
                }
            );
        }
    ]);
