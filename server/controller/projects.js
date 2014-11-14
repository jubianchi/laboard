var q = require('q');

module.exports = function(router, container) {
    var callback = function(req, res, callback) {
            return function (err, resp, body) {
                if (err) {
                    res.error(err);

                    return;
                }

                if (resp.statusCode !== 200) {
                    res.error(body, resp.statusCode);

                    return;
                }

                return callback(body);
            };
        };

    router.authenticated.get('/projects',
        function(req, res) {
            var projects = [],
                page = 0,
                fetch = function(deferred) {
                    container.get('gitlab.projects').all(
                        req.user.private_token,
                        function (err, resp, body) {
                            if (err) {
                                deferred.reject();
                            } else {
                                callback(
                                    req,
                                    res,
                                    function(body) {
                                        projects = projects.concat(body);

                                        if (resp.links.next) {
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

    router.authenticated.get('/projects/:ns/:name',
        function(req, res) {
            container.get('gitlab.projects').one(
                req.user.private_token,
                req.params.ns,
                req.params.name,
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

    router.authenticated.get('/projects/:ns/:name/members',
        function(req, res) {
            container.get('gitlab.projects').members(
                req.user.private_token,
                req.params.ns,
                req.params.name,
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

    router.authenticated.get('/projects/:ns/:name/labels',
        function(req, res) {
            container.get('gitlab.labels').all(
                req.user.private_token,
                req.params.ns,
                req.params.name,
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
};
