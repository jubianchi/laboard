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
    }
};
