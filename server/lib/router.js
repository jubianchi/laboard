var express = require('express'),
    decorate = function(router, secure, logger) {
        ['get', 'post', 'put', 'delete'].forEach(function(method) {
            var m = router[method];

            router[method] = function() {
                if (logger) {
                    logger.info('Adding %sroute %s %s', secure ? 'secured ' : '', method.toUpperCase(), arguments[0]);
                }

                var args = Array.prototype.slice.call(arguments);
                if (secure) {
                    args = args.slice(0, 1).concat([secure]).concat(args.slice(1));
                }

                return m.apply(router, args);
            }
        });

        return router;
    },
    router = module.exports = function router(security, logger) {
        this.router = decorate(express.Router(), false, logger);
        this.logger = logger;

        if (security) {
            this.authenticated = decorate(express.Router(), security, logger);
            this.router.use(this.authenticated);
        }

    };

router.prototype = {
    setup: function (application) {
        application
            .use(this.router)
            .router = this.router;

        return this;
    },
    get: function() {
        return this.router.get.apply(this.router, Array.prototype.slice.call(arguments));
    },
    post: function() {
        return this.router.post.apply(this.router, Array.prototype.slice.call(arguments));
    },
    put: function() {
        return this.router.put.apply(this.router, Array.prototype.slice.call(arguments));
    },
    delete: function() {
        return this.router.delete.apply(this.router, Array.prototype.slice.call(arguments));
    }
};
