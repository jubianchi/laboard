var winston = require('winston'),
    Logger = require('winston').Logger,
    Console = winston.transports.Console;

module.exports = function(application) {
    application.logger = new Logger({
        transports: [
            new Console(application.config.logger)
        ]
    });

    var prefix,
        info = application.logger.info,
        debug = application.logger.debug,
        warn = application.logger.warn,
        error = application.logger.error,
        args = function(args) {
            var a = Array.prototype.slice.call(args);

            if(prefix) {
                a[0] = prefix + ' ' + a[0];
            }

            return a;
        };

    application.logger.setPrefix = function(p) {
        prefix = p;
    };

    application.logger.info = function() {
        info.apply(application.logger, args(arguments));
    };

    application.logger.warn = function() {
        warn.apply(application.logger, args(arguments));
    };

    application.logger.debug = function() {
        debug.apply(application.logger, args(arguments));
    };

    application.logger.error = function() {
        error.apply(application.logger, args(arguments));
    };
};
