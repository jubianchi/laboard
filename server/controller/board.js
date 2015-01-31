var _ = require('lodash');

module.exports = function(router, container) {
    var config = container.get('config');

    router.authenticated.get('/projects/:ns/:name/columns',
        function (req, res) {
            container.get('redis').hget(
                'laboard:' + req.params.ns + ':' + req.params.name, 'columns',
                function(err, columns) {
                    if (err) {
                        res.error(err, 500);

                        return;
                    }

                    columns = JSON.parse(columns) || [];

                    container.get('gitlab.labels').all(
                        req.user.private_token,
                        req.params.ns,
                        req.params.name,
                        function(err, resp, labels) {
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

                                    container.get('gitlab.labels').persist(
                                        req.user.private_token,
                                        req.params.ns,
                                        req.params.name,
                                        label,
                                        function(req, res, label) {
                                            column.color = label.color;
                                        }
                                    );
                                } else {
                                    column.color = label.color;
                                }

                                return column;
                            });

                            res.response.ok(_.values(columns));
                        }
                    );
                }
            );
        }
    );

    router.authenticated.post('/projects/:ns/:name/columns',
        container.get('authorization')('master'),
        function(req, res) {
            var column = req.body,
                createColumn = function(label) {
                    container.get('redis').hget(
                        'laboard:' + req.params.ns + ':' + req.params.name, 'columns',
                        function(err, columns) {
                            columns = JSON.parse(columns) || {};

                            if (!columns[column.title]) {
                                columns[column.title] = {
                                    title: column.title,
                                    closable: !!column.closable,
                                    canGoBackward: !!column.canGoBackward,
                                    position: column.position || 0,
                                    limit: column.limit ? (column.limit < 0 ? 0 : parseInt(column.limit, 10)) : 0
                                };

                                container.get('redis').hset(
                                    'laboard:' + req.params.ns + ':' + req.params.name, 'columns',
                                    JSON.stringify(columns),
                                    function(err) {
                                        if (err) {
                                            res.error(err, 500);

                                            return;
                                        }

                                        columns[column.title].color = label.color;

                                        container.get('websocket.emitter').emit(
                                            'column.new',
                                            {
                                                namespace: req.params.ns,
                                                project: req.params.name,
                                                column: columns[column.title]
                                            }
                                        );

                                        res.response.created(columns[column.title]);
                                    }
                                )
                            } else {
                                res.error.conflict({
                                    message: 'Conflict'
                                });
                            }
                        }
                    );
                };


            container.get('gitlab.labels').all(
                req.user.private_token,
                req.params.ns,
                req.params.name,
                function(err, resp, labels) {
                    var label;

                    if (!column.title) {
                        res.error({
                            message: 'Conflict'
                        }, 400);

                        return;
                    }

                    if (labels) {
                        label = _.find(labels, { name: config.column_prefix + column.title.toLowerCase() });
                    }

                    if (!label) {
                        label = {
                            name: config.column_prefix + column.title.toLowerCase(),
                            color: '#E5E5E5'
                        };

                        container.get('gitlab.labels').persist(
                            req.user.private_token,
                            req.params.ns,
                            req.params.name,
                            label,
                            function(req, res, label) {
                                createColumn(label);
                            }
                        );
                    } else {
                        createColumn(label);
                    }
                }
            );
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

                                container.get('websocket.emitter').emit(
                                    'column.edit',
                                    {
                                        namespace: req.params.ns,
                                        project: req.params.name,
                                        column: columns[req.params.column]
                                    }
                                );

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
                        columns[req.params.column].position = req.body.position;

                        container.get('redis').hset(
                            'laboard:' + req.params.ns + ':' + req.params.name, 'columns',
                            JSON.stringify(columns),
                            function(err) {
                                if (err) {
                                    res.error(err, 500);

                                    return;
                                }

                                columns[req.params.column].color = req.body.color;

                                container.get('websocket.emitter').emit(
                                    'column.move',
                                    {
                                        namespace: req.params.ns,
                                        project: req.params.name,
                                        from: columns[req.params.column].position,
                                        to: req.body.position,
                                        column: columns[req.params.column]
                                    }
                                );

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

                                container.get('websocket.emitter').emit(
                                    'column.remove',
                                    {
                                        namespace: req.params.ns,
                                        project: req.params.name,
                                        column: column
                                    }
                                );

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
