var q = require('q');

module.exports = function(router, container) {
    var callback = function(req, res, callback) {
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

    router.post('/projects/:ns/:name/issues/hook',
        function(req, res) {
            container.get('websocket.emitter').emit(
                'issue.update',
                {
                    namespace: req.params.ns,
                    project: req.params.name,
                    issue: req.body.object_attributes
                }
            );

            res.response.ok(req.body);
        }
    );

    router.authenticated.get('/projects/:ns/:name/issues/metrics/cycle',
        function(req, res) {
            var sql = 'SELECT ' +
                '    source.to AS \'column\', ' +
                '    DAY(entry.date) as \'day\', ' +
                '    WEEK(entry.date) as \'week\', ' +
                '    MONTH(entry.date) as \'month\', ' +
                '    YEAR(entry.date) as \'year\', ' +
                '    AVG(TIME_TO_SEC(TIMEDIFF(destination.date, source.date))) AS \'time\' ' +
                'FROM ' +
                '    ( ' +
                '        SELECT entry.date, entry.issue ' +
                '        FROM moves AS entry ' +
                '        WHERE (entry.from IS NULL OR entry.from = \'\')' +
                '    ) AS entry, ' +
                '    moves AS source ' +
                'LEFT JOIN ' +
                '    moves AS destination ON ( ' +
                '        destination.to != \'__unpin__\' AND ' +
                '        source.to=destination.from AND ' +
                '        source.issue=destination.issue AND ' +
                '        destination.date > source.date ' +
                '    ) ' +
                'WHERE ' +
                '    source.to != \'__unpin__\' AND ' +
                '    entry.issue = source.issue AND ' +
                '    destination.from IS NOT NULL AND ' +
                '    destination.namespace = \'' + req.params.ns + '\' AND ' +
                '    destination.project = \'' + req.params.name + '\' ' +
                'GROUP BY ' +
                '    DATE_FORMAT(entry.date, \'%Y-%m-%d\'), ' +
                '    source.to';

            container.get('mysql').execute(
                sql,
                function(err, result) {
                    if (err) {
                        res.error(err);

                        return;
                    }

                    res.response.ok(result);
                }
            );
        }
    );

    router.authenticated.get('/projects/:ns/:name/issues',
        function(req, res) {
            var issues = [],
                page = 0,
                fetch = function(deferred) {
                    container.get('gitlab.issues').all(
                        req.user.private_token,
                        req.params.ns,
                        req.params.name,
                        function (err, resp, body) {
                            if (err) {
                                deferred.reject();
                            } else {
                                callback(
                                    req,
                                    res,
                                    function(body) {
                                        issues = issues.concat(body);

                                        if (resp.links.next) {
                                            fetch(deferred);
                                        } else {
                                            deferred.resolve(issues);
                                        }
                                    }
                                )(err, resp, body);
                            }
                        },
                        {
                            page: (++page)
                        }
                    );

                    return deferred.promise;
                };

            fetch(q.defer())
                .then(
                function(issues) {
                    res.response.ok(issues);
                }
            );
        }
    );

    router.authenticated.get('/projects/:ns/:name/issues/:id',
        function(req, res) {
            container.get('gitlab.issues').one(
                req.user.private_token,
                req.params.ns,
                req.params.name,
                req.params.id,
                function (err, resp, body) {
                    callback(
                        req,
                        res,
                        res.response.ok
                    )(err, resp, body);
                }
            );
        }
    );

    router.authenticated.put('/projects/:ns/:name/issues/:id',
        container.get('authorization')('developer'),
        function(req, res) {
            var issue = req.body;
            delete issue.access_token;

            container.get('gitlab.issues').persist(
                req.user.private_token,
                req.params.ns,
                req.params.name,
                issue,
                callback(
                    req,
                    res,
                    function(body) {
                        container.get('websocket.emitter').emit(
                            'issue.edit',
                            {
                                namespace: req.params.ns,
                                project: req.params.name,
                                issue: body
                            }
                        );

                        res.response.ok(body);
                    }
                )
            );
        }
    );

    router.authenticated.put('/projects/:ns/:name/issues/:id/move',
        container.get('authorization')('developer'),
        function(req, res) {
            var issue = req.body;
            delete issue.access_token;

            if (!issue.from && !issue.to) {
                res.error.notAcceptable({
                    message: 'Not acceptable'
                });
            } else {
                var from = (issue.from || '').toLowerCase(),
                    to = (issue.to || '').toLowerCase(),
                    old = container.get('config').column_prefix + from,
                    nw = container.get('config').column_prefix + to;

                (issue.labels || []).forEach(function(label, key) {
                    if ([old, nw].indexOf(label) > -1) {
                        issue.labels.splice(key, 1);
                    }
                });

                if (from !== to && to) {
                    issue.labels.push(nw);
                    issue.column = to;
                } else {
                    issue.column = null;
                }

                container.get('gitlab.issues').persist(
                    req.user.private_token,
                    req.params.ns,
                    req.params.name,
                    issue,
                    callback(
                        req,
                        res,
                        function(body) {
                            container.get('mysql').execute(
                                'INSERT INTO moves VALUES(?, ?, ?, ?, ?, ?)',
                                [
                                    req.params.ns,
                                    req.params.name,
                                    issue.id,
                                    from,
                                    to || '__unpin__',
                                    new Date()
                                ]
                            );

                            container.get('websocket.emitter').emit(
                                'issue.move',
                                {
                                    namespace: req.params.ns,
                                    project: req.params.name,
                                    from: from,
                                    to: to,
                                    issue: body
                                }
                            );

                            res.response.ok(body);
                        }
                    )
                );
            }
        }
    );

    router.authenticated.put('/projects/:ns/:name/issues/:id/theme',
        container.get('authorization')('developer'),
        function(req, res) {
            var issue = req.body;
            delete issue.access_token;

            if (!issue.before && !issue.after) {
                res.error.notAcceptable({
                    message: 'Not acceptable'
                });
            } else {
                var before = (issue.before || '').toLowerCase(),
                    after = (issue.after || '').toLowerCase(),
                    old = container.get('config').theme_prefix + (before || 'default'),
                    nw = container.get('config').theme_prefix + (after || 'default');

                (issue.labels || []).forEach(function(label, key) {
                    if ([old, nw].indexOf(label) > -1) {
                        issue.labels.splice(key, 1);
                    }
                });

                if (before !== after && after) {
                    issue.labels.push(nw);
                    issue.theme = after;
                } else {
                    issue.theme = null;
                }

                container.get('gitlab.issues').persist(
                    req.user.private_token,
                    req.params.ns,
                    req.params.name,
                    issue,
                    callback(
                        req,
                        res,
                        function(body) {
                            container.get('websocket.emitter').emit(
                                'issue.theme',
                                {
                                    namespace: req.params.ns,
                                    project: req.params.name,
                                    issue: body,
                                    before: before,
                                    after: after
                                }
                            );

                            res.response.ok(body);
                        }
                    )
                );
            }
        }
    );

    router.authenticated.put('/projects/:ns/:name/issues/:id/star',
        container.get('authorization')('developer'),
        function(req, res) {
            var issue = req.body,
                starred_label = container.get('config').board_prefix + 'starred';
            delete issue.access_token;

            issue.labels = issue.labels.filter(function(label) { return label !== starred_label; });

            if (issue.starred) {
                issue.labels.push(starred_label);
            }

            container.get('gitlab.issues').persist(
                req.user.private_token,
                req.params.ns,
                req.params.name,
                issue,
                callback(
                    req,
                    res,
                    function(body) {
                        container.get('websocket.emitter').emit(
                            'issue.star',
                            {
                                namespace: req.params.ns,
                                project: req.params.name,
                                issue: body
                            }
                        );

                        res.response.ok(body);
                    }
                )
            );
        }
    );

    router.authenticated.put('/projects/:ns/:name/issues/:id/close',
        container.get('authorization')('developer'),
        function(req, res) {
            var issue = req.body;

            container.get('gitlab.issues').close(
                req.user.private_token,
                req.params.ns,
                req.params.name,
                issue,
                callback(
                    req,
                    res,
                    function(body) {
                        container.get('mysql').execute(
                            'INSERT INTO moves VALUES(?, ?, ?, ?, ?, ?)',
                            [
                                req.params.ns,
                                req.params.name,
                                issue.id,
                                issue.column,
                                '__close__',
                                new Date()
                            ]
                        );

                        container.get('websocket.emitter').emit(
                            'issue.close',
                            {
                                namespace: req.params.ns,
                                project: req.params.name,
                                issue: body
                            }
                        );

                        res.response.ok(body);
                    }
                )
            );
        }
    );
};
