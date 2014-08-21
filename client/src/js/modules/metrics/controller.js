angular.module('laboard-frontend')
    .controller('MetricsController', [
        '$rootScope', '$scope', '$http', '$stateParams', 'FlowGraphDataFactory',
        function ($root, $scope, $http, $params, $graph) {
            var render = function() {
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
                                        text: 'Year / Week'
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
                                    text: 'Cumulative flow graph'
                                }
                            };
                        }
                    );
            };

            $root.$on('graph.interval', function() {
                console.log('graph.interval');
                render();
            });

            render();
        }
    ])
    .controller('MetricsMenuController', [
        '$rootScope', '$scope', 'FlowGraphDataFactory',
        function ($root, $scope, $graph) {
            $scope.interval = 'week';
            console.log('MetricsMenuController');

            $scope.setInterval = function(interval) {
                console.log('setInterval');

                $graph.setInterval(interval);
                $scope.interval = interval;

                $root.$broadcast('graph.interval');
            }
        }
    ]);
