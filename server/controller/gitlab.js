var _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    request = require('request');

module.exports = function(router, authenticated, application) {
    router.get('/projects',
        authenticated,
        function(req, res) {
            request.get(
                application.config.gitlab_url + '/api/v3/projects?per_page=100&private_token=' + req.user.private_token,
                function (err, resp, body) {
                    if (err) {
                        res.error(err);

                        return;
                    }

                    body = JSON.parse(body);

                    if (resp.statusCode !== 200) {
                        res.error(body, resp.statusCode);

                        return;
                    }

                    var projects = _.filter(
                        body,
                        function(project) {
                            return project.issues_enabled;
                        }
                    );

                    res.response.ok(projects);
                }
            );
        }
    );

    router.get('/projects/:ns/:name/columns',
        authenticated,
        function(req, res) {
            var file = application.config.data_dir + '/' + req.params.ns + '_' + req.params.name + '.json',
                columns = [];

            if (fs.existsSync(file)) {
                columns = JSON.parse(fs.readFileSync(file));
            }

            res.response.ok(_.values(columns));
        }
    );

    router.post('/projects/:ns/:name/columns',
        authenticated,
        function(req, res) {
            var file = application.config.data_dir + '/' + req.params.ns + '_' + req.params.name + '.json',
                column = req.body,
                columns = {};

            if (fs.existsSync(file)) {
                columns = JSON.parse(fs.readFileSync(file));
            }

            if (!columns[column.title]) {
                columns[column.title] = {
                    title: column.title,
                    position: column.position || 0,
                    theme: column.theme || 'default'
                };

                fs.writeFileSync(file, JSON.stringify(columns));

                res.response.created(column);
            } else {
                res.error.conflict({
                    message: 'Conflict'
                });
            }
        }
    );

    router.put('/projects/:ns/:name/columns',
        authenticated,
        function(req, res) {
            var file = application.config.data_dir + '/' + req.params.ns + '_' + req.params.name + '.json',
                column = req.body,
                columns = {};

            if (fs.existsSync(file)) {
                columns = JSON.parse(fs.readFileSync(file));
            }

            if (columns[column.title]) {
                if (typeof column.theme !== "undefined") columns[column.title].theme = column.theme;
                if (typeof column.position !== "undefined") columns[column.title].position = column.position;

                fs.writeFileSync(file, JSON.stringify(columns));

                res.response.ok(column);
            } else {
                res.error.notFound({
                    message: 'Not found'
                });
            }
        }
    );

    router.delete('/projects/:ns/:name/columns',
        authenticated,
        function(req, res) {
            var file = application.config.data_dir + '/' + req.params.ns + '_' + req.params.name + '.json',
                column = req.body,
                columns = {};

            if (fs.existsSync(file)) {
                columns = JSON.parse(fs.readFileSync(file));
            }

            if (columns[column.title]) {
                var col = columns[column.title];

                delete columns[column.title];

                fs.writeFileSync(file, JSON.stringify(columns));

                res.response.ok(col);
            } else {
                res.error.notFound({
                    message: 'Not found'
                });
            }
        }
    );

    router.get('/projects/:ns/:name/issues',
        authenticated,
        function(req, res) {
            request.get(
                application.config.gitlab_url + '/api/v3/projects/' + req.params.ns + '%2F' + req.params.name + '/issues?per_page=100&private_token=' + req.user.private_token,
                function (err, resp, body) {
                    if (err) {
                        res.error(err);

                        return;
                    }

                    try {
                        body = JSON.parse(body);

                        if (resp.statusCode !== 200) {
                            res.error(body, resp.statusCode);

                            return;
                        }

                        var issues = _.filter(
                            body,
                            function(issue) {
                                return issue.state !== 'closed';
                            }
                        );

                        res.response.ok(issues);
                    } catch(e) {
                        res.error(body, resp.statusCode);
                    }
                }
            );
        }
    );

    router.put('/projects/:ns/:name/issues/:id',
        authenticated,
        function(req, res) {
            var issue = req.body;
            delete issue['access_token'];

            request(
                {
                    method: 'PUT',
                    uri: application.config.gitlab_url + '/api/v3/projects/' + req.params.ns + '%2F' + req.params.name + '/issues/' + req.params.id + '?private_token=' + req.user.private_token,
                    body: JSON.stringify(issue),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                },
                function (err, resp, body) {
                    if (err) {
                        res.error(err);

                        return;
                    }

                    body = JSON.parse(body || '{}');

                    if (resp.statusCode !== 200) {
                        res.error(body, resp.statusCode);

                        return;
                    }

                    res.response.ok(body);
                }
            );
        }
    );
};
