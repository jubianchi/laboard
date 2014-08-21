angular.module('laboard-frontend')
    .controller('MetricsController', [
        '$rootScope', '$scope', '$http', '$stateParams', 'ColumnsRepository', '$q',
        function ($root, $scope, $http, $params, $columns, $q) {
            var weeks = [],
                series = [],
                data = [],
                round = function (num, dec) {
                    return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
                },
                label = function (line) {
                    switch($scope.interval) {
                        case 'day':
                            return line.day + '/' + line.month + '/' + line.year;

                        case 'month':
                            return line.month + '/' + line.year;

                        case 'year':
                            return line.year;

                        case 'week':
                        default:
                            return line.week + '/' + line.year;
                    }
                },
                load = function() {
                    var deferred = $q.defer();

                    weeks = [];
                    series = [];
                    data = [];

                    $scope.error = false;

                    $http.get('/projects/' + $params.namespace + '/' + $params.project + '/issues/metrics')
                        .success(function (res) {
                            data = res;

                            console.log(data);

                            if (!data || !data.length) {
                                deferred.reject();
                            }

                            data.forEach(function (line) {
                                var lbl = label(line);

                                if (weeks.indexOf(lbl) === -1) weeks.push(lbl);
                            });

                            deferred.resolve(data);
                        });

                    return deferred.promise;
                },
                render = function() {
                    load()
                        .then($columns.all, function() {
                            $scope.error = true;
                        })
                        .then(function (columns) {
                            _.sortBy(columns, 'position')
                                .forEach(function (column) {
                                    var id = column.title.toLowerCase(),
                                        values = [];

                                    for (var i = 0; i < weeks.length; i++) {
                                        values[i] = 0;
                                    }

                                    _.filter(
                                        data,
                                        function (line) {
                                            return line.column === id;
                                        }
                                    ).forEach(function (line) {
                                            var weekIndex = weeks.indexOf(label(line));

                                            values[weekIndex] = round(line.time / 86400, 1);
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
                                        height: $(document).height() - 120
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
                                series: series,
                                xAxis: {
                                    categories: weeks,
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
                                    text: null
                                },
                                loading: false
                            };
                        });
                };

            $scope.interval = 'week';
            render();

            $scope.setInterval = function(interval) {
                console.log(interval);
                $scope.interval = interval;

                render();
            }
        }
    ]);
