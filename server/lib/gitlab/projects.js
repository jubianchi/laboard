var _ = require('lodash'),
    projects = module.exports = function projects(client, formatter) {
        this.client = client;
        this.formatter = formatter;
    };

projects.prototype = {
    url: function(namespace, project, base) {
        var url = namespace;

        base = base || '/projects';

        if (!namespace && !project) {
            return base;
        }

        if (project) {
            url += '%2F' + project;
        }

        return base + '/' + url;
    },

    one: function(token, namespace, project, callback) {
        var url = this.url(namespace, project),
            format = this.formatter.formatProjectFromGitlab;

        return this.client.get(
            token,
            url,
            function(err, resp, body) {
                callback(err, resp, format(body));
            }
        );
    },

    members: function(token, namespace, project, callback) {
        var url = this.url(namespace, project);

        return this.client.get(
            token,
            url + '/members',
            function(err, resp, project_members) {
                return this.client.get(
                    token,
                    this.url(namespace, null, '/groups') + '/members',
                    function(err, resp, group_members) {
                        callback(err, resp, _.uniq(project_members.concat(group_members), 'id'));
                    }
                );
            }.bind(this)
        );
    },

    all: function(token, callback, params) {
        var url = this.url(),
            format = this.formatter.formatProjectFromGitlab;

        params = params || {};

        if (!params.per_page) {
            params.per_page = 100;
        }

        return this.client.get(
            token,
            url,
            params,
            function(err, resp, body) {
                body = body
                    .filter(
                        function (project) {
                            return !!project.issues_enabled;
                        }
                    )
                    .map(format);

                callback(err, resp, body);
            }
        );
    }
};
