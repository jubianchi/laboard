module.exports = function(router, container) {
    router.post('/login',
        function(req, res) {
            var callback = function (token) {
                var expire = new Date();
                expire.setDate(expire.getDate() + 7);

                res.cookie('access_token', JSON.stringify(token), { expires: expire });
                res.response.ok(token);
            };

            var promise;

            if (req.body.username) {
                promise = container.get('gitlab').login(req.body.username, req.body.password);
            } else {
                promise = container.get('gitlab').auth(req.body.password);
            }

            promise.then(callback).fail(res.error);
        }
    );

    router.authenticated.get('/logout',
        function(req, res) {
            res.clearCookie('access_token');
            res.end();
        }
    );

    router.authenticated.get('/login/check',
        function(req, res) {
            if (req.cookies.access_token) {
                container.get('http.client').get(
                    container.get('config').gitlab_url + '/api/v3/user?private_token=' + req.cookies.access_token.private_token,
                    function (err, resp, body) {
                        if (err) {
                            res.error(err);

                            return;
                        }

                        body = JSON.parse(body);

                        if (resp.statusCode !== 200) {
                            res.error(body, resp.statusCode);
                        } else {
                            res.response.ok(body);
                        }
                    }
                );
            } else {
                res.error.unauthorized();
            }
        }
    );

    router.get('/login/failed',
        function(req, res) {
            res.error.unauthorized();
        }
    );
};
