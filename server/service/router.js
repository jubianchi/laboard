var request = require('request');

module.exports = function(application) {
    var router = require('express').Router(),
        response = function(res) {
            return function(items, code) {
                code = code || 200;

                res.status(code).end(JSON.stringify(items));
            }
        },
        error = function(res) {
            return function(err, code) {
                code = code || 500;

                application.logger.error(err);

                if(err.stack) {
                    application.logger.error(err.stack);
                }

                res.status(err.code || code).json(err);
            }
        },
        authenticated = application.auth.authenticate('bearer', { session: false });

    application
        .use(router)
        .router = router;

    router.all('*', function(req, res, next) {
        res.response = response(res);

        res.response.ok = function(content) {
            res.response(content, 200);
        };

        res.response.created = function(content) {
            res.response(content, 201);
        };

        res.error = error(res);

        res.error.notFound = function(err) {
            res.error(err, 404);
        };

        res.error.conflict = function(err) {
            res.error(err, 409);
        };

        res.error.unauthorized = function(err) {
            res.error(err, 401);
        };

        next();
    });

    require('../controller/auth.js')(router, authenticated, application);
    require('../controller/gitlab.js')(router, authenticated, application);
    require('../controller/board.js')(router, authenticated, application);
};
