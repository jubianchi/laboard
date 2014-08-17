var _ = require('lodash'),
    projects = module.exports = function projects(client) {
        this.client = client;
    },
    format = function(project) {
        project.access_level = 10;

        if (project.permissions) {
            if (project.permissions.project_access && project.permissions.project_access.access_level > project.access_level) {
                project.access_level = project.permissions.project_access.access_level;
            }

            if (project.permissions.group_access && project.permissions.group_access.access_level > project.access_level) {
                project.access_level = project.permissions.group_access.access_level;
            }
        }

        return _.pick(project, ['path_with_namespace', 'description', 'last_activity_at', 'id', 'access_level']);
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

    one: function(token, namespace, project, callback) {
        var url = this.url(namespace, project);

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
            function(err, resp, body) {
                callback(err, resp, body);
            }
        );
    },

    all: function(token, callback, params) {
        var url = this.url();

        if (!params) params = {};

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
