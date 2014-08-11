var _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    request = require('request');

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

            issue.labels = _.filter(issue.labels, function(v) { return v && v.length > 0; });

            return issue;
        },
        formatTags = function(issue) {
            if (issue.column) {
                issue.labels.push('column:' + issue.column)
            }

            if (issue.theme) {
                issue.labels.push('theme:' + issue.theme)
            }

            return issue;
        };

    router.get('/projects',
        authenticated,
        function(req, res) {
            application.gitlab.project.all(
                req.user.private_token,
                function (err, resp, body) {
                    var response = callback(
                        req,
                        res,
                        function(body) {
                            var projects = _.filter(
                                body,
                                function(project) {
                                    return project.issues_enabled;
                                }
                            );

                            res.response.ok(projects.map(function(project) {
                                return _.pick(project, ['path_with_namespace', 'description', 'last_activity_at', 'id'])
                            }));
                        }
                    );

                    response(err, resp, body);
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
                            var issues = _.filter(
                                body,
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
            var issue = req.body,
                from = issue.from.toLowerCase(),
                to = issue.to.toLowerCase();

            if (!issue.from || !issue.to) {
                res.error.notAcceptable({
                    message: 'Not acceptable'
                });
            } else {
                var old = 'column:' + from,
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
