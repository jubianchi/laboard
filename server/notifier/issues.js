var q = require('q'),
    issues = module.exports = function issues(websocket) {
        var emit = function(event, namespace, project, issue, args) {
                var data = {
                    namespace: namespace,
                    project: project,
                    issue: issue
                };

                Object.keys(args || {}).forEach(function(key) {
                    data[key] = args[key];
                });

                websocket.emit(event, data);

                return issue;
            };

        this.notifyClose = function(namespace, project, issue) {
            return emit('issue.close', namespace, project, issue);
        };

        this.notifyEdit = function(namespace, project, issue) {
            return emit('issue.edit', namespace, project, issue);
        };

        this.notifyUpdate = function(namespace, project, issue) {
            return emit('issue.update', namespace, project, issue);
        };

        this.notifyMove = function(namespace, project, issue, from, to) {
            return emit('issue.move', namespace, project, issue, { from: from, to: to });
        };

        this.notifyTheme = function(namespace, project, issue, before, after) {
            return emit('issue.theme', namespace, project, issue, { before: before, after: after });
        };

        this.notifyStar = function(namespace, project, issue) {
            return emit('issue.star', namespace, project, issue);
        };
    };
