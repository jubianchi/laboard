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
            container.get('server.websocket').broadcast(
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

    router.authenticated.get('/projects/:ns/:name/issues/metrics',
        function(req, res) {
            container.get('mysql').query(
                'SELECT ' +
                    'destination.from AS \'from\', ' +
                    'YEAR(destination.date) AS year, ' +
                    'WEEK(destination.date) AS week, ' +
                    'AVG(TIME_TO_SEC(TIMEDIFF(source.date, destination.date))) AS days ' +
                'FROM ' +
                    'moves AS source ' +
                'LEFT JOIN ' +
                    'moves AS destination ON ( ' +
                        'source.from=destination.to AND ' +
                        'source.issue=destination.issue ' +
                    ')' +
                'WHERE ' +
                    'destination.from IS NOT NULL ' +
                'GROUP BY ' +
                    'YEAR(destination.date), ' +
                    'WEEK(destination.date), ' +
                    'destination.from',
                function(err, result) {
                    console.log(result);
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
        function(req, res) {
            var issue = req.body;
            delete issue['access_token'];

            container.get('gitlab.issues').persist(
                req.user.private_token,
                req.params.ns,
                req.params.name,
                issue,
                callback(
                    req,
                    res,
                    function(body) {
                        container.get('server.websocket').broadcast(
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
        function(req, res) {
            var issue = req.body;
            delete issue['access_token'];

            if (!issue.from && !issue.to) {
                res.error.notAcceptable({
                    message: 'Not acceptable'
                });
            } else {
                var from = (issue.from || '').toLowerCase(),
                    to = (issue.to || '').toLowerCase(),
                    old = 'column:' + from,
                    nw = 'column:' + to;

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
                            container.get('mysql').query(
                                'INSERT INTO moves VALUES(?, ?, ?, ?, ?, ?)',
                                [
                                    req.params.ns,
                                    req.params.name,
                                    issue.id,
                                    from,
                                    to,
                                    new Date()
                                ]
                            );

                            container.get('server.websocket').broadcast(
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
        function(req, res) {
            var issue = req.body;
            delete issue['access_token'];

            if (!issue.before && !issue.after) {
                res.error.notAcceptable({
                    message: 'Not acceptable'
                });
            } else {
                var before = (issue.before || '').toLowerCase(),
                    after = (issue.after || '').toLowerCase(),
                    old = 'theme:' + (before || 'default'),
                    nw = 'theme:' + (after || 'default');

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
                            container.get('server.websocket').broadcast(
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

    router.authenticated.put('/projects/:ns/:name/issues/:id/close',
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
                        container.get('server.websocket').broadcast(
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
