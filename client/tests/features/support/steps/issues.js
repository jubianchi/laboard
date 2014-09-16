var chai = require('chai'),
    expect = chai.expect;

module.exports = function(cucumber) {
    browser.findIssue = function(iid, callback) {
        var condition = function () {
            return element(by.cssContainingText('.issue .panel-heading', '#' + iid))
                .isDisplayed();
        };

        return browser.wait(condition, 10, 'Issue #' + iid + ' was not seen after 10 seconds')
            .then(function() {
                return element(by.cssContainingText('.issue .panel-heading', '#' + iid))
                   .element(by.xpath('ancestor::div[1]'));
            });
    };

    browser.findIssueMenu = function(iid) {
        browser.findIssue(iid)
            .then(function(issue) {
                return issue.element(by.css('.panel-heading .dropdown-menu'));
            });
    };

    cucumber.Given(/^issue #(\d+) of "([^"]*)" is in the "([^"]*)" column$/, function(iid, project, column, next) {
        browser
            .executeScript('mock.addIssueToColumn(\'' + project + '\', ' + iid + ', \'' + column + '\');')
            .then(next);
    });

    cucumber.When(/^I open the menu of the issue #(\d+)$/, function(iid, next) {
        browser.findIssue(title)
            .then(function(issue) {
                issue.element(by.css('[data-toggle=dropdown]'))
                    .click()
                    .then(next);
            });
    });

    cucumber.When(/^I click on "([^"]*)" in the menu of the issue #(\d+)$/, function(text, iid, next) {
        browser.findIssueMenu(iid)
            .then(function(menu) {
                menu.element(by.cssContainingText('a', text))
                    .click()
                    .then(next);
            });
    });

    cucumber.Then(/I should see the issue #(\d+)$/, function(iid, next) {
        browser.findIssue(iid)
            .then(function() {
                next();
            });
    });

    cucumber.Then(/I should not see the issue #(\d+)$/, function (iid, next) {
        var condition = function () {
            return element(by.cssContainingText('.issue .panel-heading', iid))
                .isDisplayed();
        };

        browser.wait(condition, 10)
            .then(
                function () {
                    next(new Error('Issue #"' + iid + '" was seen in page'));
                },
                function () {
                    next();
                }
            );
    });

    cucumber.Then(/I should see the issue #(\d+) in the "([^"]*)" column$/, function (iid, title, next) {
        browser.findColumn(title)
            .then(function(column) {
                var condition = function () {
                    return column.element(by.cssContainingText('.issue .panel-heading', '#' + iid))
                        .isDisplayed();
                };

                browser.wait(condition, 10, 'Issue #' + iid + ' was not seen in ' + title + ' column after 10 seconds')
                    .then(
                        function() {
                            next();
                        }
                    );
            });
    });
};
