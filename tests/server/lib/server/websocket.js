var atoum = require('atoum.js')(module),
    testedClass = require('../../../../server/lib/server/websocket');

module.exports = {
    testClass: function() {
        this.object(new testedClass);
    },

    testStart: function() {
        var websocket, server;

        this
            .if(server = new (
                this.generateMock({
                    listen: function () {},
                    on: function () {},
                    listeners: function () {
                        return [];
                    },
                    removeAllListeners: function () {}
                })
            ))
            .and(websocket = new testedClass)
            .then()
                .object(websocket.start(server)).isIdenticalTo(websocket)
                .mock(server).call('on')
            .if(server.controller.override('on', function () { throw new Error; }))
            .then()
                .object(websocket.start(server)).isIdenticalTo(websocket)
        ;
    }
};
