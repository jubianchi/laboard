var q = require('q'),
    projects = module.exports = function projects(client, formatter) {
        this.client = client;
        this.formatter = formatter;
    };

projects.prototype = {
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

    one: function(token, namespace, project) {
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
                        deferred.resolve(this.formatter.formatProjectFromGitlab(body));
                    }
                }
            }.bind(this)
        );

        return deferred.promise;
    },

    members: function(token, namespace, project) {
        var url = this.url(namespace, project),
            deferred = q.defer();

        this.client.get(
            token,
            url + '/members',
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

    all: function(token, params) {
        var url = this.url(),
            deferred = q.defer(),
            page = 0,
            projects = [],
            fetch = function() {
                params = params || {};
                params.page = ++page;
                params.per_page = 2;

                this.client.get(
                    token,
                    url,
                    params,
                    function(err, resp, body) {
                        if (err) {
                            deferred.reject(err);
                        } else {
                            if (resp.statusCode !== 200) {
                                deferred.reject(resp);
                            } else {
                                projects = projects.concat(
                                    body
                                        .filter(function (project) { return !!project.issues_enabled; })
                                        .map(this.formatter.formatProjectFromGitlab)
                                );

                                if (resp.links.next) {
                                    fetch();
                                } else {
                                    deferred.resolve(projects);
                                }
                            }
                        }
                    }.bind(this)
                );

                return deferred.promise;
            }.bind(this);

        return fetch();
    }
};
