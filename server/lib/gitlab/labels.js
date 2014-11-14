var projects = module.exports = function projects(client) {
    this.client = client;
};

projects.prototype = {
    url: function(namespace, project) {
        return '/projects/' + namespace + '%2F' + project + '/labels';
    },

    all: function(token, namespace, project, callback) {
        return this.client.get(
            token,
            this.url(namespace, project),
            callback
        );
    },

    persist: function(token, namespace, project, label, callback) {
        return this.client.post(
            token,
            this.url(namespace, project),
            label,
            function(err, resp, body) {
                callback(err, resp, body);
            }
        );
    }
};
