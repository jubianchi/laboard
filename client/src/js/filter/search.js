angular.module('laboard-frontend')
    .filter('search', [
        function() {
            var searchMilestone = function(query) {
                    var regex = new RegExp(query, 'i');

                    return function(issue) {
                        return issue.milestone && regex.test(issue.milestone.title);
                    }
                },
                searchAssignee = function(query) {
                    var regex = new RegExp(query, 'i');

                    return function(issue) {
                        return (
                            (issue.assignee && (regex.test(issue.assignee.username) || regex.test(issue.assignee.name))) ||
                            (issue.author && (regex.test(issue.author.username) || regex.test(issue.author.name)))
                        );
                    }
                },
                searchAll = function(query) {
                    var regex = new RegExp(query, 'i');

                    return function(issue) {
                        return regex.test(JSON.stringify(issue));
                    }
                },
                searchNumber = function(query) {
                    var regex = new RegExp(query, 'i');

                    return function(issue) {
                        return regex.test(issue.iid);
                    }
                };

            return function(values, query) {
                if(query) {
                    var search = searchAll;

                    if (/^@/.test(query)) {
                        search = searchAssignee;
                        query = query.replace(/^@/, '');
                    } else if (/^#/.test(query)) {
                        search = searchNumber;
                        query = query.replace(/^#/, '');
                    } else if (/^:/.test(query)) {
                        search = searchMilestone;
                        query = query.replace(/^:/, '');
                    }

                    values = values.filter(search(query));
                }

                return values;
            };
        }
    ]);
