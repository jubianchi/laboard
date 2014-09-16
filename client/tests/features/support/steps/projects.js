module.exports = function(cucumber) {
    cucumber.Given(/^project "([^"]*)" exists in namespace "([^"]*)"/, function(project, namespace, next) {
        browser
            .executeScript('mock.addProject(\'' + namespace + '\', \'' + project + '\');')
            .then(next);
    });

    cucumber.Given(/^project "([^"]*)" has column "([^"]*)"/, function(project, column, next) {
        browser
            .executeScript('mock.addColumn(\'' + project + '\', \'' + column + '\');')
            .then(next);
    });

    cucumber.Given(/^project "([^"]*)" has issue #(\d+) "([^"]*)"/, function(project, iid, title, next) {
        browser
            .executeScript('mock.addIssue(\'' + project + '\', ' + iid + ', \'' + title + '\');')
            .then(next);
    });
};
