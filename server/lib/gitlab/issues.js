var q = require('q'),
    issues = module.exports = function issues(client, projects, formatter, container) {
        this.client = client;
        this.projects = projects;
        this.formatter = formatter;
        this.container = container;
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

    one: function(token, namespace, project, id) {
        var deferred = q.defer(),
            url = this.url(namespace, project, id);

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
                        deferred.resolve(this.formatter.formatIssueFromGitlab(body));
                    }
                }
            }.bind(this)
        );

        return deferred.promise;
    },

    all: function(token, namespace, project, params) {
        var url = this.url(namespace, project),
            deferred = q.defer(),
            page = 0,
            issues = [],
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
                                issues = issues.concat(
                                    body
                                        .filter(function (issue) {
                                            return issue.state !== 'closed' || issue.labels.indexOf(this.container.get('config').board_prefix + 'starred') > -1;
                                        }.bind(this))
                                        .map(this.formatter.formatIssueFromGitlab)
                                );

                                if (resp.links.next) {
                                    fetch();
                                } else {
                                    deferred.resolve(issues);
                                }
                            }
                        }
                    }.bind(this)
                );

                return deferred.promise;
            }.bind(this);

        return fetch();
    },

    persist: function(token, namespace, project, issue) {
        var url = this.url(namespace, project, issue.id),
            deferred = q.defer();

        this.client.put(
            token,
            url,
            this.formatter.formatIssueToGitlab(issue),
            function(err, resp, body) {
                if (err) {
                    deferred.reject(err);
                } else {
                    if (resp.statusCode !== 200) {
                        deferred.reject(resp);
                    } else {
                        deferred.resolve(this.formatter.formatIssueFromGitlab(body));
                    }
                }
            }.bind(this)
        );

        return deferred.promise;
    },

    close: function(token, namespace, project, issue) {
        issue.state_event = 'close';

        return this.persist(token, namespace, project, issue);
    }
};
