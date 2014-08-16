var server = module.exports = function server(port, logger) {
    this.port = port;
    this.logger = logger;
    this.server = null;
};

server.prototype = {
    start: function (application) {
        if (this.server === null) {
            var logger = this.logger,
                server;

            server = application.listen(
                this.port,
                function() {
                    if(logger) logger.info('Listening on port %d', server.address().port);
                }
            );

            this.server = server;
        }

        return this;
    }
};
