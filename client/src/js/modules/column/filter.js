angular.module('laboard-frontend')
    .filter('orderIssues', [
        '$filter', '$rootScope',
        function () {
            return function(issues) {
                var sortDate = function(a, b) {
                    a = new Date(a.updated_at).getTime();
                    b = new Date(b.updated_at).getTime();

                    if (a < b) {
                        return 1;
                    }

                    if (a > b) {
                        return -1;
                    }

                    return 0;
                };

                return issues
                    .filter(function(issue) {
                        return issue.state !== 'closed'
                    })
                    .sort(sortDate)
                    .concat(
                        issues
                            .filter(function(issue) {
                                return issue.state === 'closed'
                            })
                            .sort(function(a, b) {
                                if (a.state === 'closed' && b.state !== 'closed') {
                                    return 1;
                                }

                                return sortDate(a, b);
                            })
                    );
            }
        }
    ]);
