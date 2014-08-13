var request = require('request');

module.exports = function(router, authenticated, application) {
    router.post('/login',
        function(req, res) {
            request.get(
                application.config.gitlab_url + '/api/v3/user?private_token=' + req.body.password,
                function (err, resp, body) {
                    if (err) {
                        error(err);

                        return;
                    }

                    body = JSON.parse(body);

                    if (resp.statusCode !== 200) {
                        res.error(body, resp.statusCode);

                        return;
                    }

                    var expire = new Date();
                    expire.setDate(expire.getDate() + 7);

                    res.cookie('access_token', body, { expires: expire });
                    res.response.ok(body);
                }
            );
        }
    );

    router.get('/logout',
        authenticated,
        function(req, res) {
            res.clearCookie('access_token');
            res.end();
        }
    );

    router.get('/login/check',
        authenticated,
        function(req, res) {
            if (req.cookies.access_token) {
                request.get(
                    application.config.gitlab_url + '/api/v3/user?private_token=' + req.cookies.access_token.private_token,
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

                        res.response.ok(body);
                    }
                );
            } else {
                res.error.unauthorized({
                    message: 'Unauthorized'
                });
            }
        }
    );

    router.get('/login/failed',
        function(req, res) {
            res.error.unauthorized({
                message: 'Unauthorized'
            });
        }
    );
};
