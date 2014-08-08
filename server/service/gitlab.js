var _ = require('underscore'),
    request = require('request');

module.exports = function(application) {
    var base = application.config.gitlab_url + '/api/v3',
        client = {
            url: function(token, url, params) {
                var query = '',
                    sep = '?';

                if (!params) {
                    params = [];
                }

                params['private_token'] = token;

                Object.keys(params).forEach(function(key) {
                    query += sep + key + '=' + params[key];
                    sep = '&';
                });

                return base + url + query;
            },
            get: function(token, url, params, callback) {
                if (typeof params === "function") {
                    callback = params;
                    params = [];
                }

                return request.get(this.url(token, url, params), callback);
            },
            put: function(token, url, body, params, callback) {
                if (typeof params === "function") {
                    callback = params;
                    params = [];
                }

                request(
                    {
                        method: 'PUT',
                        uri: this.url(token, url, params),
                        body: JSON.stringify(body),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    },
                    callback
                );
            }
        };

    application.gitlab = {
        project: {
            url: function(namespace, project) {
                var base = '/projects',
                    url = namespace;

                if (!namespace && !project) {
                    return base;
                }

                if (project) {
                    url = namespace + '%2F' + project;
                }

                return base + '/' + url;
            },

            one: function(token, namespace, project, callback) {
                var url = this.url(namespace, project);

                return client.get(token, url, callback);
            },

            all: function(token, callback) {
                var url = this.url();

                return client.get(token, url, callback);
            }
        },
        issue: {
            url: function(namespace, project, id) {
                if (typeof project === "number") {
                    id = project;
                    project = null;
                }

                var base = application.gitlab.project.url(namespace, project) + '/issues';

                if (!id) {
                    return base;
                }

                return base + '/' + id;
            },

            one: function(token, namespace, project, id, callback) {
                var url = this.url(namespace, project, id);

                return client.get(token, url, callback);
            },

            all: function(token, namespace, project, callback) {
                var url = this.url(namespace, project);

                return client.get(token, url, callback);
            },

            persist: function(token, namespace, project, issue, callback) {
                var url = this.url(namespace, project, issue.id);

                return client.put(token, url, issue, callback);
            }
        }
    };
};
