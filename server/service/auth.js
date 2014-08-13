var passport = require('passport'),
    request = require('request'),
    Bearer = require('passport-http-bearer').Strategy;

module.exports = function(application) {
    passport
        .use(
            new Bearer(
                {
                    passReqToCallback: true
                },
                function(req, token, done) {
                    request.get(
                        application.config.gitlab_url + '/api/v3/user?private_token=' + token.private_token,
                        function (err, resp, body) {
                            if (err) {
                                req.res.error(err);

                                return;
                            }

                            if (resp.statusCode !== 200) {
                                req.res.error.unauthorized(body);

                                return;
                            }

                            done(null, JSON.parse(body));
                        }
                    );


                }
            )
        );

    application
        .use(passport.initialize())
        .use(passport.session())
        .auth = passport;
};
