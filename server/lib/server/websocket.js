var websocket = module.exports = function server(logger) {
    this.logger = logger;
    this.websocket = null;
};

websocket.prototype = {
    start: function (server) {
        if (this.websocket === null) {
            if(this.logger) this.logger.info('Listening on port %d', server.address().port);

            this.websocket = require('socket.io')(server);

            this.websocket.sockets.on('connection', function(socket) {
                socket.emit('message', { message: 'laboard' });
            });
        }

        return this;
    }
};
