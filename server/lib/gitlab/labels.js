var q = require('q'),
    labels = module.exports = function labels(client) {
        this.client = client;
    };

labels.prototype = {
    url: function(namespace, project) {
        return '/projects/' + namespace + '%2F' + project + '/labels';
    },

    all: function(token, namespace, project) {
        var url = this.url(namespace, project),
            deferred = q.defer();

        this.client.get(
            token,
            url,
            function(err, resp, body) {
                if (err) {
                    deferred.reject(err);
                } else {
                    if (resp.statusCode !== 200) {
                        deferred.reject(resp);
                    } else {
                        deferred.resolve(body);
                    }
                }
            }
        );

        return deferred.promise;
    },

    persist: function(token, namespace, project, label) {
        var url = this.url(namespace, project),
            deferred = q.defer();

        this.client.post(
            token,
            url,
            label,
            function(err, resp, body) {
                if (err) {
                    deferred.reject(err);
                } else {
                    if (resp.statusCode !== 200) {
                        deferred.reject(resp);
                    } else {
                        deferred.resolve(body);
                    }
                }
            }
        );

        return deferred.promise;
    }
};
