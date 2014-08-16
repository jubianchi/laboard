var auth = module.exports = function auth(url, http) {
    var passport = require('passport'),
        Bearer = require('passport-http-bearer').Strategy;

    this.url = url;
    this.passport = passport
        .use(
            new Bearer(
                {
                    passReqToCallback: true
                },
                function(req, token, done) {
                    http.get(
                        url + '/api/v3/user?private_token=' + token.private_token,
                        function (err, resp, body) {
                            if (err) {
                                done(err);

                                return;
                            }

                            if (resp.statusCode !== 200) {
                                req.res.status(resp.statusCode);
                                done(err);

                                return;
                            }

                            done(null, JSON.parse(body));
                        }
                    );


                }
            )
        );

    this.authenticate = this.passport.authenticate('bearer', { session: false });
};

auth.prototype = {
    setup: function (application) {
        application
            .use(this.passport.initialize())
            .use(this.passport.session())
            .use(function(req, res, next) {
                if (req.cookies.access_token) {
                    req.body.access_token = req.cookies.access_token;
                }

                next();
            })
            .auth = this.passport;

        return this;
    }
};
