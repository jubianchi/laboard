var _ = require('lodash'),
    fs = require('fs');

module.exports = function(router, container) {
    var config = container.get('config'),
        callback = function(req, res, callback) {
            return function (err, resp, body) {
                if (err) {
                    return res.error(err);
                }

                if (resp.statusCode !== 200) {
                    return res.error(body, resp.statusCode);
                }

                return callback(body);
            };
        };

    router.authenticated.get('/projects/:ns/:name/columns',
        function (req, res) {
            var file = config.data_dir + '/' + req.params.ns + '_' + req.params.name + '.json',
                columns = [];

            if (fs.existsSync(file)) {
                columns = JSON.parse(fs.readFileSync(file));
            }

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
                                color: '#B5B5B5'
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

    router.authenticated.post('/projects/:ns/:name/columns',
        container.get('authorization')('master'),
        function(req, res) {
            var file = config.data_dir + '/' + req.params.ns + '_' + req.params.name + '.json',
                column = req.body,
                columns = {},
                createColumn = function(label) {
                    if (fs.existsSync(file)) {
                        columns = JSON.parse(fs.readFileSync(file));
                    }

                    columns[column.title] = {
                        title: column.title,
                        closable: !!column.closable,
                        canGoBackward: !!column.canGoBackward,
                        position: column.position || 0,
                        limit: column.limit ? (column.limit < 0 ? 0 : parseInt(column.limit, 10)) : 0
                    };

                    fs.writeFileSync(file, JSON.stringify(columns));

                    columns[column.title].color = label.color;

                    container.get('server.websocket').broadcast(
                        'column.new',
                        {
                            namespace: req.params.ns,
                            project: req.params.name,
                            column: columns[column.title]
                        }
                    );

                    res.response.created(columns[column.title]);
                };

            if (!columns[column.title]) {
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
                                color: '#B5B5B5'
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
            } else {
                res.error.conflict({
                    message: 'Conflict'
                });
            }
        }
    );

    router.authenticated.put('/projects/:ns/:name/columns/:column',
        container.get('authorization')('master'),
        function(req, res) {
            var file = config.data_dir + '/' + req.params.ns + '_' + req.params.name + '.json',
                column = req.body,
                columns = {};

            if (fs.existsSync(file)) {
                columns = JSON.parse(fs.readFileSync(file));
            }

            if (columns[req.params.column]) {
                if (typeof column.position !== "undefined") { columns[req.params.column].position = column.position; }
                if (typeof column.closable !== "undefined") { columns[req.params.column].closable = column.closable; }
                if (typeof column.canGoBackward !== "undefined") { columns[req.params.column].canGoBackward = column.canGoBackward; }
                if (typeof column.limit !== "undefined") { columns[req.params.column].limit = column.limit ? (column.limit < 0 ? 0 : parseInt(column.limit, 10)) : 0; }

                fs.writeFileSync(file, JSON.stringify(columns));

                container.get('server.websocket').broadcast(
                    'column.edit',
                    {
                        namespace: req.params.ns,
                        project: req.params.name,
                        column: columns[req.params.column]
                    }
                );

                res.response.ok(columns[req.params.column]);
            } else {
                res.error.notFound({
                    message: 'Not found'
                });
            }
        }
    );

    router.authenticated.put('/projects/:ns/:name/columns/:column/move',
        container.get('authorization')('master'),
        function(req, res) {
            var file = config.data_dir + '/' + req.params.ns + '_' + req.params.name + '.json',
                columns = JSON.parse(fs.readFileSync(file)),
                from = columns[req.params.column].position,
                to =  req.body.position;

            if (typeof req.body.position === 'undefined') {
                res.error.notAcceptable({
                    message: 'Not acceptable'
                });
            } else {
                columns[req.params.column].position = to;

                fs.writeFileSync(file, JSON.stringify(columns));

                columns[req.params.column].color = req.body.color;

                container.get('server.websocket').broadcast(
                    'column.move',
                    {
                        namespace: req.params.ns,
                        project: req.params.name,
                        from: from,
                        to: to,
                        column: columns[req.params.column]
                    }
                );

                res.response.ok(columns[req.params.column]);
            }
        }
    );

    router.authenticated.delete('/projects/:ns/:name/columns/:column',
        container.get('authorization')('master'),
        function(req, res) {
            var file = config.data_dir + '/' + req.params.ns + '_' + req.params.name + '.json',
                column = req.body,
                columns = {};

            if (fs.existsSync(file)) {
                columns = JSON.parse(fs.readFileSync(file));
            }

            if (columns[req.params.column]) {
                var col = columns[req.params.column];

                delete columns[req.params.column];

                fs.writeFileSync(file, JSON.stringify(columns));

                container.get('server.websocket').broadcast(
                    'column.remove',
                    {
                        namespace: req.params.ns,
                        project: req.params.name,
                        column: col
                    }
                );

                res.response.ok(col);
            } else {
                res.error.notFound({
                    message: 'Not found'
                });
            }
        }
    );
};
