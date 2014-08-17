var  _ = require('lodash'),
    issues = module.exports = function issues(client, projects) {
        this.client = client;
        this.projects = projects;
    },
    format = function(issue) {
        issue = _.pick(issue, ['id', 'iid', 'title', 'created_at', 'updated_at', 'assignee', 'author', 'labels', 'milestone']);
        issue.column = null;
        issue.theme = null;

        (issue.labels || []).forEach(function(label, key) {
            if (/^column:/.test(label)) {
                issue.column = label.replace(/^column:/, '');
                delete issue.labels[key];
            }

            if (/^theme:/.test(label)) {
                issue.theme = label.replace(/^theme:/, '');
                delete issue.labels[key];
            }
        });

        issue.labels = (issue.labels || []).filter(function(v) { return v && v.length > 0; });

        return issue;
    },
    formatOut = function(issue) {
        if (issue.labels.split) {
            issue.labels = issue.labels.split(',');
        }

        if (issue.column) {
            issue.labels.push('column:' + issue.column)
        }

        if (issue.theme) {
            issue.labels.push('theme:' + issue.theme)
        }

        if (issue.labels.length === 0) {
            issue.labels = [''];
        }

        if (issue.labels.join) {
            issue.labels = issue.labels.join(',');
        }

        return issue;
    };

issues.prototype = {
    url: function(namespace, project, id) {
        if (typeof project === "number") {
            id = project;
            project = null;
        }

        var base = this.projects.url(namespace, project) + '/issues';

        if (!id) {
            return base;
        }

        return base + '/' + id;
    },

    one: function(token, namespace, project, id, callback) {
        var url = this.url(namespace, project, id);

        return this.client.get(
            token,
            url,
            function(err, resp, body) {
                callback(err, resp, format(body));
            }
        );
    },

    all: function(token, namespace, project, callback, params) {
        var url = this.url(namespace, project);

        return this.client.get(
            token,
            url,
            params,
            function(err, resp, body) {
                body = body
                    .filter(
                        function (issue) {
                            return issue.state !== 'closed';
                        }
                    )
                    .map(format);

                callback(err, resp, body);
            }
        );
    },

    persist: function(token, namespace, project, issue, callback) {
        var url = this.url(namespace, project, issue.id);

        return this.client.put(
            token,
            url,
            formatOut(issue),
            function(err, resp, body) {
                callback(err, resp, format(body));
            }
        );
    },

    close: function(token, namespace, project, issue, callback) {
        var url = this.url(namespace, project, issue.id);

        issue.state_event = 'close';

        return this.client.put(
            token,
            url,
            formatOut(issue),
            function(err, resp, body) {
                callback(err, resp, format(body));
            }
        );
    }
};
