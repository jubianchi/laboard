angular.module('laboard-frontend')
    .controller('MetricsController', [
        '$rootScope', '$scope', '$http', '$stateParams', 'ColumnsRepository',
        function ($root, $scope, $http, $params, $columns) {
            $http.get('/projects/' + $params.namespace + '/' + $params.project + '/issues/metrics')
                .success(function(data) {
                    var weeks = [],
                        series = [],
                        round = function(num, dec) {
                            return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
                        },
                        label = function(line) {
                            return line.week + ' / ' + line.year;
                        };

                    data.forEach(function(line) {
                        var lbl = label(line);

                        if (weeks.indexOf(lbl) === -1) weeks.push(lbl);
                    });

                    $columns.all()
                        .then(function(columns) {
                            _.sortBy(columns, function (column) { return -column.position; })
                                .forEach(function (column) {
                                    var id = column.title.toLowerCase(),
                                        values = [];

                                    for (var i = 0; i < weeks.length; i++) {
                                        values[i] = 0;
                                    }

                                    _.filter(
                                        data,
                                        function(line) {
                                            return line.from === id;
                                        }
                                    ).forEach(function (line) {
                                        var weekIndex = weeks.indexOf(label(line));

                                        values[weekIndex] = round(line.days / 86400, 1);
                                    });

                                    series[series.length] = {
                                        name: column.title,
                                        data: values
                                    };
                                });

                            $scope.chart = {
                                options: {
                                    chart: {
                                        type: 'area',
                                        spacingTop: 50,
                                        height: $(document).height() - 100
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
                                series: series.reverse(),
                                xAxis: {
                                    categories: weeks,
                                    title: {
                                        text: 'Year / Week'
                                    }
                                },
                                yAxis: {
                                    title: {
                                        text: 'Days'
                                    }
                                },
                                title: {
                                    text: 'Cumulative flow graph'
                                },
                                loading: false
                            };
                        });
                });
        }
    ]);
