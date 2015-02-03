var q = require('q');

module.exports = function(router, container) {
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

    router.authenticated.get('/projects/:ns/:name/issues',
        function(req, res) {
            container.get('gitlab.issues').all(req.user.private_token, req.params.ns, req.params.name)
                .then(res.response.ok, res.error)
                .fail(res.error);
        }
    );

    router.authenticated.get('/projects/:ns/:name/issues/:id',
        function(req, res) {
            container.get('gitlab.issues').one(req.user.private_token, req.params.ns, req.params.name, req.params.id)
                .then(res.response.ok, res.error)
                .fail(res.error);
        }
    );

    router.authenticated.put('/projects/:ns/:name/issues/:id',
        container.get('authorization')('developer'),
        function(req, res) {
            delete req.body.access_token;

            container.get('gitlab.issues').persist(req.user.private_token, req.params.ns, req.params.name, req.body)
                .then(function(issue) {
                    container.get('websocket.emitter').emit(
                        'issue.edit',
                        {
                            namespace: req.params.ns,
                            project: req.params.name,
                            issue: issue
                        }
                    );

                    return issue;
                })
                .then(res.response.ok, res.error)
                .fail(res.error);
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

                container.get('gitlab.issues').persist(req.user.private_token, req.params.ns, req.params.name, issue)
                    .then(function(issue) {
                        container.get('websocket.emitter').emit(
                            'issue.move',
                            {
                                namespace: req.params.ns,
                                project: req.params.name,
                                from: from,
                                to: to,
                                issue: issue
                            }
                        );

                        return issue;
                    })
                    .then(res.response.ok, res.error)
                    .fail(res.error);
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

                container.get('gitlab.issues').persist(req.user.private_token, req.params.ns, req.params.name, issue)
                    .then(function(issue) {
                        container.get('websocket.emitter').emit(
                            'issue.theme',
                            {
                                namespace: req.params.ns,
                                project: req.params.name,
                                issue: issue,
                                before: before,
                                after: after
                            }
                        );

                        return issue;
                    })
                    .then(res.response.ok, res.error)
                    .fail(res.error);
            }
        }
    );

    router.authenticated.put('/projects/:ns/:name/issues/:id/star',
        container.get('authorization')('developer'),
        function(req, res) {
            var issue = req.body,
                starredLabel = container.get('config').board_prefix + 'starred';

            delete issue.access_token;

            issue.labels = issue.labels.filter(function(label) { return label !== starredLabel; });

            if (issue.starred) {
                issue.labels.push(starredLabel);
            }

            container.get('gitlab.issues').persist(req.user.private_token, req.params.ns, req.params.name, issue)
                .then(function(issue) {
                    container.get('websocket.emitter').emit(
                        'issue.star',
                        {
                            namespace: req.params.ns,
                            project: req.params.name,
                            issue: issue
                        }
                    );

                    return issue;
                })
                .then(res.response.ok, res.error)
                .fail(res.error);
        }
    );

    router.authenticated.put('/projects/:ns/:name/issues/:id/close',
        container.get('authorization')('developer'),
        function(req, res) {
            delete req.body.access_token;

            container.get('gitlab.issues').close(req.user.private_token, req.params.ns, req.params.name, req.body)
                .then(function(issue) {
                    container.get('websocket.emitter').emit(
                        'issue.close',
                        {
                            namespace: req.params.ns,
                            project: req.params.name,
                            issue: issue
                        }
                    );

                    return issue;
                })
                .then(res.response.ok, res.error)
                .fail(res.error)
        }
    );
};
