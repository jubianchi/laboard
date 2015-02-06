var q = require('q'),
    _ = require('lodash');

module.exports = function(router, container) {
    var config = container.get('config');

    router.authenticated.get('/projects/:ns/:name/columns',
        function (req, res) {
            q.all([
                q.ninvoke(container.get('redis'), 'hget', 'laboard:' + req.params.ns + ':' + req.params.name, 'columns'),
                container.get('gitlab.labels').all(req.user.private_token, req.params.ns, req.params.name)
            ])
                .spread(function(columns, labels) {
                    columns = JSON.parse(columns) || [];

                    columns = _.values(columns).map(function(column) {
                        var label;

                        if (labels) {
                            label = _.find(labels, { name: config.column_prefix + column.title.toLowerCase() });
                        }

                        if (!label) {
                            label = {
                                name: config.column_prefix + column.title.toLowerCase(),
                                color: '#E5E5E5'
                            };

                            container.get('gitlab.labels').persist(req.user.private_token, req.params.ns, req.params.name, label)
                                .then(function(label) {
                                    column.color = label.color;
                                });
                        } else {
                            column.color = label.color;
                        }

                        return column;
                    });

                    return _.values(columns);
                })
                .then(res.response.ok)
                .fail(res.error);
        }
    );

    router.authenticated.post('/projects/:ns/:name/columns',
        container.get('authorization')('master'),
        function(req, res) {
            var column = req.body,
                createColumn = function(label) {
                    return q.ninvoke(container.get('redis'), 'hget', 'laboard:' + req.params.ns + ':' + req.params.name, 'columns')
                        .then(function(columns) {
                            var deferred = q.defer();

                            columns = JSON.parse(columns) || {};

                            if (columns[column.title]) {
                                deferred.reject({
                                    code: 409,
                                    message: 'Conflict'
                                });
                            } else {
                                columns[column.title] = {
                                    title: column.title,
                                    closable: !!column.closable,
                                    canGoBackward: !!column.canGoBackward,
                                    unpinned: !!column.unpinned,
                                    position: column.position || 0,
                                    limit: column.limit ? (column.limit < 0 ? 0 : parseInt(column.limit, 10)) : 0
                                };

                                deferred.resolve(columns);
                            }

                            return deferred.promise;
                        })
                        .then(function(columns) {
                            var deferred = q.defer();

                            q.ninvoke(container.get('redis'), 'hset', 'laboard:' + req.params.ns + ':' + req.params.name, 'columns', JSON.stringify(columns))
                                .then(function() {
                                    columns[column.title].color = label.color;

                                    deferred.resolve(columns[column.title]);
                                });

                            return deferred.promise;
                        });
                };

            if (!column.title) {
                res.error({ message: 'Bad Request' }, 400);
            }

            container.get('gitlab.labels').all(req.user.private_token, req.params.ns, req.params.name)
                .then(function(labels) {
                    var label;

                    if (labels) {
                        label = _.find(labels, { name: config.column_prefix + column.title.toLowerCase() });
                    }

                    return label;
                })
                .then(function(label) {
                    var deferred = q.defer();

                    if (!label) {
                        label = {
                            name: config.column_prefix + column.title.toLowerCase(),
                            color: '#E5E5E5'
                        };

                        container.get('gitlab.labels').persist(req.user.private_token, req.params.ns, req.params.name, label)
                            .then(deferred.resolve, deferred.reject);
                    } else {
                        deferred.resolve(label);
                    }

                    return deferred.promise;
                })
                .then(createColumn)
                .then(function(column) {
                    return container.get('notifier.columns').notifyNew(req.params.ns, req.params.name, column);
                })
                .then(res.response.created)
                .fail(res.error);
        }
    );

    router.authenticated.put('/projects/:ns/:name/columns/:column',
        container.get('authorization')('master'),
        function(req, res) {
            var column = req.body;

            container.get('redis').hget(
                'laboard:' + req.params.ns + ':' + req.params.name, 'columns',
                function(err, columns) {
                    if (err) {
                        res.error(err, 500);

                        return;
                    }

                    columns = JSON.parse(columns) || {};

                    if (columns[req.params.column]) {
                        if (typeof column.position !== "undefined") { columns[req.params.column].position = column.position; }
                        if (typeof column.closable !== "undefined") { columns[req.params.column].closable = column.closable; }
                        if (typeof column.canGoBackward !== "undefined") { columns[req.params.column].canGoBackward = column.canGoBackward; }
                        if (typeof column.unpinned !== "undefined") { columns[req.params.column].unpinned = column.unpinned; }
                        if (typeof column.limit !== "undefined") { columns[req.params.column].limit = column.limit ? (column.limit < 0 ? 0 : parseInt(column.limit, 10)) : 0; }

                        container.get('redis').hset(
                            'laboard:' + req.params.ns + ':' + req.params.name, 'columns',
                            JSON.stringify(columns),
                            function(err) {
                                if (err) {
                                    res.error(err, 500);

                                    return;
                                }

                                columns[req.params.column].color = column.color;

                                container.get('notifier.columns').notifyEdit(req.params.ns, req.params.name, column);

                                res.response.ok(columns[req.params.column]);
                            }
                        );
                    } else {
                        res.error.notFound({
                            message: 'Not found'
                        });
                    }
                }
            );
        }
    );

    router.authenticated.put('/projects/:ns/:name/columns/:column/move',
        container.get('authorization')('master'),
        function(req, res) {
            if (typeof req.body.position === 'undefined') {
                res.error.notAcceptable({
                    message: 'Not acceptable'
                });
            } else {
                container.get('redis').hget(
                    'laboard:' + req.params.ns + ':' + req.params.name, 'columns',
                    function(err, columns) {
                        if (err) {
                            res.error(err, 500);

                            return;
                        }

                        columns = JSON.parse(columns) || {};

                        var from = columns[req.params.column].position,
                            to = req.body.position;

                        columns[req.params.column].position = to;

                        container.get('redis').hset(
                            'laboard:' + req.params.ns + ':' + req.params.name, 'columns',
                            JSON.stringify(columns),
                            function(err) {
                                if (err) {
                                    res.error(err, 500);

                                    return;
                                }

                                columns[req.params.column].color = req.body.color;

                                container.get('notifier.columns').notifyMove(req.params.ns, req.params.name, columns[req.params.column], from, to);

                                res.response.ok(columns[req.params.column]);
                            }
                        );
                    }
                );
            }
        }
    );

    router.authenticated.delete('/projects/:ns/:name/columns/:column',
        container.get('authorization')('master'),
        function(req, res) {
            container.get('redis').hget(
                'laboard:' + req.params.ns + ':' + req.params.name, 'columns',
                function(err, columns) {
                    if (err) {
                        res.error(err, 500);

                        return;
                    }

                    columns = JSON.parse(columns) || {};

                    if (columns[req.params.column]) {
                        var column = columns[req.params.column];

                        delete columns[req.params.column];

                        container.get('redis').hset(
                            'laboard:' + req.params.ns + ':' + req.params.name, 'columns',
                            JSON.stringify(columns),
                            function(err) {
                                if (err) {
                                    res.error(err, 500);

                                    return;
                                }

                                container.get('notifier.columns').notifyRemove(req.params.ns, req.params.name, column);

                                res.response.ok(column);
                            }
                        );
                    } else {
                        res.error.notFound({
                            message: 'Not found'
                        });
                    }
                }
            );
        }
    );
};
