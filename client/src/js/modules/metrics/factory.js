angular.module('laboard-frontend')
    .factory('FlowGraphDataFactory', [
        '$rootScope', '$q', '$http', 'ColumnsRepository',
        function($root, $q, $http, $columns) {
            var weeks = [],
                series = [],
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

                    $http.get('/projects/' + namespace + '/' + project + '/issues/metrics')
                        .success(function (res) {
                            data = res;

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
                };

            return {
                setInterval: function(newInterval) {
                    interval = newInterval;

                    return this;
                },
                getData: function(namespace, project) {
                    var deferred = $q.defer(),
                        series = [];

                    load(namespace, project)
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
                                        data: values
                                    };
                                });

                            deferred.resolve({
                                series: series,
                                dates: weeks
                            });
                        });

                    return deferred.promise;
                }
            }
        }
    ]);
