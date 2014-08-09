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

            (issue.labels || []).forEach(function(label) {
                if (/^column:/.test(label)) {
                    issue.column = label.replace(/^column:/, '');
                }

                if (/^theme:/.test(label)) {
                    issue.theme = label.replace(/^theme:/, '');
                }
            });

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
                issue,
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
                var old = 'column:' + from;

                if (from === to) return;

                issue.labels.forEach(function(label, key) {
                    if ([old, 'column:' + to].indexOf(label) > -1) {
                        issue.labels.splice(key, 1);
                    }
                });

                issue.labels.push('column:' + to);

                application.gitlab.issue.persist(
                    req.user.private_token,
                    req.params.ns,
                    req.params.name,
                    issue,
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
                    old = 'theme:' + (before || 'default');

                if (before === after) return;

                issue.labels.forEach(function(label, key) {
                    if ([old, 'theme:' + after].indexOf(label) > -1) {
                        issue.labels.splice(key, 1);
                    }
                });

                if (after) {
                    issue.labels.push('theme:' + after);
                }

                application.gitlab.issue.persist(
                    req.user.private_token,
                    req.params.ns,
                    req.params.name,
                    issue,
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
                issue,
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
