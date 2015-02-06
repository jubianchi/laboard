var chai = require('chai'),
    expect = chai.expect;

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

    cucumber.Given(/^I select the project "([^"]*)"/, function(project, next) {
        var modal,
            condition = function() {
                modal = element(by.css('.modal-dialog'));

                return modal.isDisplayed();
            };

        browser.wait(condition, 10, "No modal dialog seen after 10 seconds")
            .then(function() {
                expect(modal.element(by.cssContainingText('.modal-header', 'Project')).isDisplayed())
                    .to.eventually.equal(true)
                    .and.notify(function() {
                        modal.element(by.cssContainingText('td', project)).click().then(next);
                    });
            });
    });
};
