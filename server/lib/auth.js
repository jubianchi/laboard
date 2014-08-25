var auth = module.exports = function auth(url, gitlab) {
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
                    gitlab.auth(token.private_token, req, done);
                }
            )
        );

    this.authenticate = this.passport.authenticate('bearer', { session: false });
};

auth.prototype = {
    setup: function (application) {
        application
            .use(this.passport.initialize())
            .use(function(req, res, next) {
                if (req.cookies.access_token) {
                    try {
                        req.cookies.access_token = JSON.parse(req.cookies.access_token);
                        req.body.access_token = req.cookies.access_token;
                    } catch(e) {}
                }

                next();
            })
            .auth = this.passport;

        return this;
    }
};
