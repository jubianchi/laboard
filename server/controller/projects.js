var q = require('q');

module.exports = function(router, container) {
    router.authenticated.get('/projects',
        function(req, res) {
            container.get('gitlab.projects').all(req.user.private_token)
                .then(res.response.ok, res.error)
                .fail(res.error);
        }
    );

    router.authenticated.get('/projects/:ns/:name',
        function(req, res) {
            container.get('gitlab.projects').one(req.user.private_token, req.params.ns, req.params.name)
                .then(res.response.ok, res.error)
                .fail(res.error);
        }
    );

    router.authenticated.get('/projects/:ns/:name/members',
        function(req, res) {
            container.get('gitlab.projects').members(req.user.private_token, req.params.ns, req.params.name)
                .then(res.response.ok, res.error)
                .fail(res.error);
        }
    );

    router.authenticated.get('/projects/:ns/:name/labels',
        function(req, res) {
            container.get('gitlab.labels').all(req.user.private_token, req.params.ns, req.params.name)
                .then(res.response.ok, res.error)
                .fail(res.error);
        }
    );
};
