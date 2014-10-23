var  _ = require('lodash'),
    container = require('../../container.js'),
    formatter = module.exports = {
        formatIssueFromGitlab: function(issue) {
            issue = _.pick(issue, ['id', 'iid', 'title', 'created_at', 'updated_at', 'assignee', 'author', 'labels', 'milestone']);
            issue.column = null;
            issue.theme = null;

            (issue.labels || []).forEach(function(label, key) {
                var regEx = new RegExp("^" + container.get('config').column_prefix);

                if (regEx.test(label)) {
                    issue.column = label.replace(regEx, '');
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

        formatIssueToGitlab: function(issue) {
            if (issue.labels.split) {
                issue.labels = issue.labels.split(',');
            }

            if (issue.column && issue.labels.indexOf(container.get('config').column_prefix + issue.column) === -1) {
                issue.labels.push(container.get('config').column_prefix + issue.column)
            }

            if (issue.theme && issue.labels.indexOf('theme:' + issue.theme) === -1) {
                issue.labels.push('theme:' + issue.theme)
            }

            if (issue.labels.length === 0) {
                issue.labels = [''];
            }

            if (this.version !== '7.1' && issue.labels.join) {
                issue.labels = issue.labels.join(',');
            }

            return issue;
        },

        formatProjectFromGitlab: function(project) {
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
        }
    };
