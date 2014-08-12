angular.module('laboard-frontend')
    .filter('search', [
        '$filter',
        function($filter) {
            var searchMilestone = function(query) {
                    var regex = new RegExp(query, 'i');

                    return function(issue) {
                        if (!issue.milestone) return;

                        try {
                            return semver.satisfies(issue.milestone.title, query)
                        } catch(e) {
                            return regex.test(issue.milestone.title);
                        }
                    };
                },
                searchAuthor = function(query) {
                    var regex = new RegExp(query, 'i');

                    return function(issue) {
                        return issue.author && (regex.test(issue.author.username) || regex.test(issue.author.name));
                    };
                },
                searchAssignee = function(query) {
                    var regex = new RegExp(query, 'i');

                    return function(issue) {
                        return issue.assignee && (regex.test(issue.assignee.username) || regex.test(issue.assignee.name));
                    };
                },
                searchPeople = function(query) {
                    var regex = new RegExp(query, 'i');

                    return function(issue) {
                        return (
                            (issue.assignee && (regex.test(issue.assignee.username) || regex.test(issue.assignee.name))) ||
                            (issue.author && (regex.test(issue.author.username) || regex.test(issue.author.name)))
                        );
                    };
                },
                searchNumber = function(query) {
                    var regex = new RegExp(query, 'i');

                    return function(issue) {
                        return regex.test(issue.iid);
                    };
                };

            return function(values, query) {
                if(query) {
                    if (/^(@|#|:)/.test(query)) {
                        var search;

                        if (/^@/.test(query)) {
                            if (/^@from /.test(query)) {
                                search = searchAuthor;
                                query = query.replace(/^@from /, '');
                            } else if (/^@to /.test(query)) {
                                search = searchAssignee;
                                query = query.replace(/^@to /, '');
                            } else {
                                search = searchPeople;
                                query = query.replace(/^@/, '');
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

                return values;
            };
        }
    ]);
