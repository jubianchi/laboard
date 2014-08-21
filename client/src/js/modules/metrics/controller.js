angular.module('laboard-frontend')
    .controller('MetricsController', [
        '$rootScope', '$scope', '$http', '$stateParams', 'FlowGraphDataFactory', 'ProjectManager',
        function ($root, $scope, $http, $params, $graph, $projectManager) {
            var render = function() {
                $scope.error = false;

                $graph.getData($params.namespace, $params.project)
                    .then(
                        function(data) {
                            $scope.chart = {
                                options: {
                                    chart: {
                                        type: 'area',
                                        spacingTop: 50,
                                        height: $(document).height() - 50
                                    },
                                    plotOptions: {
                                        area: {
                                            stacking: 'normal'
                                        }
                                    },
                                    tooltip: {
                                        shared: true,
                                        valueSuffix: ' day(s)'
                                    },
                                    credits: {
                                        position: {
                                            y: 10
                                        }
                                    }
                                },
                                series: data.series,
                                xAxis: {
                                    categories: data.dates,
                                    title: {
                                        text: 'Incoming date'
                                    }
                                },
                                yAxis: {
                                    title: {
                                        text: 'Days'
                                    },
                                    reversedStacks: false,
                                    stackLabels: {
                                        enabled: true,
                                        formatter: function() {
                                            return this.total + ' day(s)'
                                        },
                                        verticalAlign: 'top'
                                    }
                                },
                                title: {
                                    text: 'Cumulative flow graph (by ' + $graph.getInterval() + ')'
                                },
                                subtitle: {
                                    text: 'Time spent in each column depending on issue\'s incoming date'
                                }
                            };
                        },
                        function() {
                            $scope.error = true;
                        }
                    );
            };

            $root.$on('graph.interval', function() {
                render();
            });

            if ($params.namespace && $params.project) {
                $projectManager.select($params.namespace + '/' + $params.project).then(
                    render,
                    function() {
                        $state.go('home');
                    }
                );
            } else {
                render();
            }
        }
    ])
    .controller('MetricsMenuController', [
        '$rootScope', '$scope', 'FlowGraphDataFactory',
        function ($root, $scope, $graph) {
            $scope.interval = 'week';
            $scope.setInterval = function(interval) {
                $graph.setInterval(interval);
                $scope.interval = interval;

                $root.$broadcast('graph.interval');
            }
        }
    ]);
