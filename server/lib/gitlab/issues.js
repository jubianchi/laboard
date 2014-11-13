var issues = module.exports = function issues(client, projects, formatter, version) {
        this.client = client;
        this.projects = projects;
        this.formatter = formatter;
        this.version = version;
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
        var url = this.url(namespace, project, id),
            format = this.formatter.formatIssueFromGitlab;

        return this.client.get(
            token,
            url,
            function(err, resp, body) {
                callback(err, resp, format(body));
            }
        );
    },

    all: function(token, namespace, project, callback, params) {
        var url = this.url(namespace, project),
            format = this.formatter.formatIssueFromGitlab;

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
        var url = this.url(namespace, project, issue.id),
            format = this.formatter.formatIssueFromGitlab,
            formatOut = this.formatter.formatIssueToGitlab;

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
        var url = this.url(namespace, project, issue.id),
            format = this.formatter.formatIssueFromGitlab,
            formatOut = this.formatter.formatIssueToGitlab;

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
