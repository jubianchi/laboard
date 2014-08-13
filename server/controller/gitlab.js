var _ = require('lodash'),
    q = require('q');

module.exports = function(router, authenticated, application) {
    var callback = function(req, res, callback) {
            return function (err, resp, body) {
                if (err) {
                    res.error(err);

                    return;
                }

                try {
                    body = JSON.parse(body);
                } catch (e) {
                    res.error(body, resp.statusCode);

                    return;
                }

                if (resp.statusCode !== 200) {
                    res.error(body, resp.statusCode);

                    return;
                }

                return callback(body);
            };
        },
        formatIssue = function(issue) {
            issue = _.pick(issue, ['id', 'iid', 'title', 'created_at', 'updated_at', 'assignee', 'author', 'labels', 'milestone']);
            issue.column = null;
            issue.theme = null;

            (issue.labels || []).forEach(function(label, key) {
                if (/^column:/.test(label)) {
                    issue.column = label.replace(/^column:/, '');
                    delete issue.labels[key];
                }

                if (/^theme:/.test(label)) {
                    issue.theme = label.replace(/^theme:/, '');
                    delete issue.labels[key];
                }
            });

            issue.labels = issue.labels.filter(function(v) { return v && v.length > 0; });

            return issue;
        },
        formatTags = function(issue) {
            if (issue.column) {
                issue.labels.push('column:' + issue.column)
            }

            if (issue.theme) {
                issue.labels.push('theme:' + issue.theme)
            }

            if (issue.labels.length === 0) {
                issue.labels = [''];
            }

            return issue;
        };

    router.get('/projects',
        authenticated,
        function(req, res) {
            var projects = [],
                page = 0,
                fetch = function(deferred) {
                    application.gitlab.project.all(
                        req.user.private_token,
                        function (err, resp, body) {
                            if (err) {
                                deferred.reject();
                            } else {
                                callback(
                                    req,
                                    res,
                                    function(body) {
                                        if(body.length > 0) {
                                            projects = projects.concat(
                                                body.filter(
                                                    function(project) {
                                                        return !!project.issues_enabled;
                                                    }
                                                ).map(function(project) {
                                                    return _.pick(project, ['path_with_namespace', 'description', 'last_activity_at', 'id'])
                                                })
                                            );

                                            fetch(deferred);
                                        } else {
                                            deferred.resolve(projects);
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
                    function(projects) {
                        res.response.ok(projects);
                    }
                );
        }
    );

    router.get('/projects/:ns/:name/issues',
        authenticated,
        function(req, res) {
            application.gitlab.issue.all(
                req.user.private_token,
                req.params.ns,
                req.params.name,
                function (err, resp, body) {
                    var response = callback(
                        req,
                        res,
                        function(body) {
                            var issues = body.filter(
                                function(issue) {
                                    return issue.state !== 'closed';
                                }
                            );

                            res.response.ok(issues.map(formatIssue));
                        }
                    );

                    response(err, resp, body);
                }
            );
        }
    );

    router.put('/projects/:ns/:name/issues/:id',
        authenticated,
        function(req, res) {
            var issue = req.body;
            delete issue['access_token'];

            application.gitlab.issue.persist(
                req.user.private_token,
                req.params.ns,
                req.params.name,
                formatTags(issue),
                callback(
                    req,
                    res,
                    function(body) {
                        var issue = formatIssue(body);

                        application.io.sockets.emit(
                            'issue',
                            {
                                namespace: req.params.ns,
                                project: req.params.name,
                                issue: issue
                            }
                        );

                        res.response.ok(issue);
                    }
                )
            );
        }
    );

    router.put('/projects/:ns/:name/issues/:id/move',
        authenticated,
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

                issue.labels.forEach(function(label, key) {
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

                application.gitlab.issue.persist(
                    req.user.private_token,
                    req.params.ns,
                    req.params.name,
                    formatTags(issue),
                    callback(
                        req,
                        res,
                        function(body) {
                            var issue = formatIssue(body);

                            application.io.sockets.emit(
                                'issue.move',
                                {
                                    namespace: req.params.ns,
                                    project: req.params.name,
                                    from: from,
                                    to: to,
                                    issue: issue
                                }
                            );

                            res.response.ok(issue);
                        }
                    )
                );
            }
        }
    );

    router.put('/projects/:ns/:name/issues/:id/theme',
        authenticated,
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

                issue.labels.forEach(function(label, key) {
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

                application.gitlab.issue.persist(
                    req.user.private_token,
                    req.params.ns,
                    req.params.name,
                    formatTags(issue),
                    callback(
                        req,
                        res,
                        function(body) {
                            var issue = formatIssue(body);

                            application.io.sockets.emit(
                                'issue.theme',
                                {
                                    namespace: req.params.ns,
                                    project: req.params.name,
                                    issue: issue,
                                    before: before,
                                    after: after
                                }
                            );

                            res.response.ok(issue);
                        }
                    )
                );
            }
        }
    );

    router.put('/projects/:ns/:name/issues/:id/close',
        authenticated,
        function(req, res) {
            var issue = req.body;

            application.gitlab.issue.close(
                req.user.private_token,
                req.params.ns,
                req.params.name,
                formatTags(issue),
                callback(
                    req,
                    res,
                    function(body) {
                        var issue = formatIssue(body);

                        application.io.sockets.emit(
                            'issue.close',
                            {
                                namespace: req.params.ns,
                                project: req.params.name,
                                issue: issue
                            }
                        );

                        res.response.ok(issue);
                    }
                )
            );
        }
    );
};
