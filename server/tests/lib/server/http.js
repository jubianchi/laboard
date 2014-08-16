var atoum = require('atoum.js')(module),
    testedClass = require('../../../lib/server/http');

module.exports = {
    testClass: function() {
        this.object(new testedClass(42));
    },

    testStart: function() {
        var application, server;

        this
            .if(application = new (this.generateMock({ 'listen': function () {} })))
            .and(server = new testedClass(42))
            .then()
                .object(server.start(application)).isIdenticalTo(server)
                .mock(application).call('listen')
            .if(application.controller.override('listen', function () { throw new Error; }))
            .then()
                .object(server.start(application)).isIdenticalTo(server)
        ;
    }
};
