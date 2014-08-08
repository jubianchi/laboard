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
            return _.pick(issue, ['id', 'iid', 'title', 'created_at', 'updated_at', 'assignee', 'author', 'labels', 'milestone']);
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
                        res.response.ok(formatIssue(body));
                    }
                )
            );
        }
    );
};
