angular.module('laboard-frontend')
    .filter('column', [
        '$filter', '$rootScope',
        function () {
            return function(issues, column) {
                if (!issues) return [];

                return _.filter(issues, function(issue) {
                    return issue.column === column.title.toLowerCase();
                });
            };
        }
    ])
    .filter('search', [
        '$filter', '$rootScope',
        function($filter, $rootScope) {
            var escape = function(str) {
                    return str.replace(/[.^$*+?()[{\\|\]-]/g, '\\$&');
                },
                searchMilestone = function(query) {
                    var regex = new RegExp(escape(query), 'i');

                    return function(issue) {
                        if (!issue.milestone) return;

                        if (/^[\w\s]+$/.test(query) === false) {
                            try {
                                var milestone = issue.milestone.title.replace(/^v/, '');
                                milestone = milestone.split('.');

                                if (milestone.length < 3) {
                                    milestone.push('0');
                                }

                                milestone = milestone.join('.');

                                return semver.satisfies(milestone, query)
                            } catch(e) {}
                        }

                        return regex.test(issue.milestone.title);
                    };
                },
                searchAuthor = function(query) {
                    var regex = new RegExp(escape(query), 'i');

                    return function(issue) {
                        return issue.author && (regex.test(issue.author.username) || regex.test(issue.author.name));
                    };
                },
                searchAssignee = function(query) {
                    var regex = new RegExp(escape(query), 'i');

                    return function(issue) {
                        return issue.assignee && (regex.test(issue.assignee.username) || regex.test(issue.assignee.name));
                    };
                },
                searchPeople = function(query) {
                    var regex = new RegExp(escape(query), 'i');

                    return function(issue) {
                        return (
                            (
                                issue.assignee &&
                                (regex.test(issue.assignee.username) || regex.test(issue.assignee.name))
                            ) ||
                            (
                                issue.author &&
                                (regex.test(issue.author.username) || regex.test(issue.author.name))
                            )
                        );
                    };
                },
                searchNumber = function(query) {
                    var regex = new RegExp('^' + escape(query), 'i');

                    return function(issue) {
                        return regex.test(issue.iid);
                    };
                };

            return function(values, query) {
                if (query && values) {
                    if (/^(@|#|:)/.test(query)) {
                        var search;

                        if (/^@/.test(query)) {
                            search = searchPeople;
                            query = query.replace(/^@/, '');

                            if (/^from /.test(query)) {
                                search = searchAuthor;
                                query = query.replace(/^from /, '');
                            } else if (/^to /.test(query)) {
                                search = searchAssignee;
                                query = query.replace(/^to /, '');
                            } else if (/^me$/.test(query)) {
                                search = searchPeople;
                                query = $rootScope.user.username;
                            }
                        } else if (/^#/.test(query)) {
                            search = searchNumber;
                            query = query.replace(/^#/, '');
                        } else if (/^:/.test(query)) {
                            search = searchMilestone;
                            query = query.replace(/^:/, '');
                        }

                        return values.filter(search(query));
                    } else {
                        return $filter('filter')(values, query);
                    }
                }

                return values || [];
            };
        }
    ]);
