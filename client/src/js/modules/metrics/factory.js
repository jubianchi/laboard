angular.module('laboard-frontend')
    .factory('GraphDataFactory', [
        '$rootScope', '$q', '$http', 'ColumnsRepository',
        function($root, $q, $http, $columns) {
            var weeks = [],
                data = [],
                interval = 'week',
                round = function (num, dec) {
                    return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
                },
                label = function (line) {
                    switch(interval) {
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
                load = function(namespace, project) {
                    var deferred = $q.defer();

                    weeks = [];
                    data = [];

                    $http.get('/projects/' + namespace + '/' + project + '/issues/metrics/cycle')
                        .success(function (res) {
                            data = res;

                            if (!data || !data.length) {
                                deferred.reject();

                                return;
                            }

                            data.forEach(function (line) {
                                var lbl = label(line);

                                if (weeks.indexOf(lbl) === -1) weeks.push(lbl);
                            });

                            deferred.resolve(data);
                        });

                    return deferred.promise;
                };

            return {
                setInterval: function(newInterval) {
                    interval = newInterval;

                    return this;
                },

                getInterval: function() {
                    return interval;
                },

                getTitle: function() {
                    return 'Cycle time (by ' + interval + ')'
                },

                getSubTitle: function() {
                    return 'Time spent in each column depending on issue\'s incoming date'
                },

                getCycleData: function(namespace, project) {
                    var deferred = $q.defer(),
                        series = [],
                        total = 0;

                    load(namespace, project, 'cycle')
                        .then($columns.all, function() {
                            deferred.reject();
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
                                        data: values,
                                        zIndex: 1
                                    };

                                    total += _(values).reduce(function(a, b) {
                                        return a + b;
                                    })
                                });

                            series[series.length] = {
                                name: 'mean',
                                data: [],
                                type: 'line',
                                stack: false,
                                zIndex: 0
                            };

                            var mean = round(total / weeks.length, 2);

                            weeks.forEach(function() {
                                series[series.length - 1].data.push(mean);
                            });

                            deferred.resolve({
                                series: series,
                                dates: weeks
                            });
                        });

                    return deferred.promise;
                },

                getData: function(namespace, project) {
                    return this.getCycleData(namespace, project);
                }
            }
        }
    ]);
