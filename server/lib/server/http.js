var server = module.exports = function server(port, logger) {
    this.port = port;
    this.logger = logger;
    this.server = null;
};

server.prototype = {
    start: function (application) {
        if (this.server === null) {
            var logger = this.logger,
                port = this.port;

            this.server = application.listen(
                port,
                function() {
                    logger.info('Http listening on port %d', port);
                }
            );

            this.server.on('error', function(err) {
                if (err.code === 'EACCES') {
                    logger.error('Failed to start server on port %d', port);
                } else {
                    logger.error(err.toString());
                }
            });
        }

        return this;
    }
};
