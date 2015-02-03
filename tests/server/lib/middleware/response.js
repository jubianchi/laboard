var atoum = require('atoum.js')(module),
    testedFunction = require('../../../../server/lib/middleware/response');

module.exports = {
    testCall: function() {
        var req, res, next;

        this
            .if(req = {})
            .and(res = {})
            .and(next = this.generateCallback())
            .then()
                .undefined(testedFunction(req, res, next))
                .callback(next).wasCalled()
                .function(res.response)
                .function(res.response.ok)
                .function(res.response.created)
                .function(res.error)
                .function(res.error.notFound)
                .function(res.error.conflict)
                .function(res.error.unauthorized)
                .function(res.error.notAcceptable)
        ;
    },

    testResponse: function() {
        var req, res, next, items, status;

        this
            .if(req = {})
            .and(res = {
                status: this.generateCallback(function() { return res; }),
                end: this.generateCallback()
            })
            .and(next = this.generateCallback())
            .and(testedFunction(req, res, next))
            .then()
                .undefined(res.response())
                .callback(res.status).wasCalled().withArguments(200)
                .callback(res.end).wasCalled().withArguments('[]')
            .if(items = [1, "foo", { hello: "World" }])
            .then()
                .undefined(res.response(items))
                .callback(res.status).wasCalled().withArguments(200)
                .callback(res.end).wasCalled().withArguments(JSON.stringify(items))
            .if(status = 204)
            .then()
                .undefined(res.response(items, status))
                .callback(res.status).wasCalled().withArguments(status)
                .callback(res.end).wasCalled().withArguments(JSON.stringify(items))
        ;
    },

    testError: function() {
        var req, res, next, error, status;

        this
            .if(req = {})
            .and(res = {
                status: this.generateCallback(function() { return res; }),
                end: this.generateCallback()
            })
            .and(next = this.generateCallback())
            .and(testedFunction(req, res, next))
            .then()
                .undefined(res.error())
                .callback(res.status).wasCalled().withArguments(500)
                .callback(res.end).wasCalled().withArguments(JSON.stringify({ code: 500 }))
            .if(error = { message: 'foobar' })
            .then()
                .undefined(res.error(error))
                .callback(res.status).wasCalled().withArguments(500)
                .callback(res.end).wasCalled().withArguments(JSON.stringify({ message: 'foobar', code: 500 }))
            .if(error = { code: 502, message: 'foobar' })
            .then()
                .undefined(res.error(error))
                .callback(res.status).wasCalled().withArguments(502)
                .callback(res.end).wasCalled().withArguments(JSON.stringify({ message: 'foobar', code: 500 }))
            .if(status = 503)
            .and(error = { message: 'foobar' })
            .then()
                .undefined(res.error(error, status))
                .callback(res.status).wasCalled().withArguments(status)
                .callback(res.end).wasCalled().withArguments(JSON.stringify({ message: 'foobar', code: status }))
        ;
    }
};
