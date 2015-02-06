var chai = require('chai'),
    expect = chai.expect;

module.exports = function(cucumber) {
    browser.findColumn = function(title) {
        var condition = function () {
            return element(by.cssContainingText('.column .panel-heading', title))
                .isDisplayed();
        };

        return browser.wait(condition, 10, 'No column with title "' + title + '" seen after 10 seconds')
            .then(function() {
                return element(by.cssContainingText('.column .panel-heading', title))
                    .element(by.xpath('ancestor::div[1]'));
            });
    };

    browser.findColumnMenu = function(title) {
        return browser.findColumn(title)
            .then(function(column) {
                return column.element(by.css('.panel-heading .dropdown-menu'));
            });
    };

    cucumber.When(/^I open the menu of the "([^"]*)" column$/, function(title, next) {
        browser.findColumn(title)
            .then(function(column) {
                column.element(by.css('[data-toggle=dropdown]'))
                    .click()
                    .then(next);
            });
    });

    cucumber.When(/^I click on "([^"]*)" in the menu of the "([^"]*)" column$/, function(text, title, next) {
        browser.findColumnMenu(title)
            .then(function(menu) {
                menu.element(by.cssContainingText('a', text))
                    .click()
                    .then(next);
            });
    });

    cucumber.Then(/I should see the "([^"]*)" column$/, function(title, next) {
        browser.findColumn(title)
            .then(function() {
                next();
            });
    });

    cucumber.Then(/I should see the "([^"]*)" column before the "([^"]*)" column$/, function(first, second, next) {
        var firstFound = false;

        element.all(by.css('.column .panel-heading'))
            .map(function (column) {
                return column.getText();
            })
            .then(function(columns) {
                columns.forEach(function (column) {
                    if (column.indexOf(first) > -1) {
                        firstFound = true;
                    }

                    if (column.indexOf(second) > -1) {
                        if (!firstFound) {
                            next(new Error('Column "' + second + '" was seen before column "' + first + '"'));
                        } else {
                            next();
                        }
                    }
                });

                if (!firstFound) {
                    next(new Error('Columns "' + first + '" and "' + second + '" were not found'));
                }
            });
    });

    cucumber.Then(/I should see the "([^"]*)" column after the "([^"]*)" column$/, function(second, first, next) {
        var firstFound = false;

        element.all(by.css('.column .panel-heading'))
            .map(function (column) {
                return column.getText();
            })
            .then(function(columns) {
                columns.forEach(function (column) {
                    if (column.indexOf(first) > -1) {
                        firstFound = true;
                    }

                    if (column.indexOf(second) > -1) {
                        if (!firstFound) {
                            next(new Error('Column "' + second + '" was seen before column "' + first + '"'));
                        } else {
                            next();
                        }
                    }
                });

                if (!firstFound) {
                    next(new Error('Columns "' + first + '" and "' + second + '" were not found'));
                }
            });
    });

    cucumber.Then(/I should not see the "([^"]*)" column$/, function (title, next) {
        expect(element(by.cssContainingText('.column .panel-heading', title)).isPresent())
            .to.become(false)
            .and.notify(next);
    });

    cucumber.Then(/the "([^"]*)" column should have the "([^"]*)" theme$/, function(title, theme, next) {
        browser.findColumn(title)
            .then(function(column) {
                expect(column.getAttribute('class')).to.eventually.contain(theme).and.notify(next);
            });
    });

    cucumber.Then(/the "([^"]*)" column should be empty$/, function(title, next) {
        browser.findColumn(title)
            .then(function(column) {
                expect(column.all(by.css('.panel-body *')).count())
                    .to.eventually.equal(0, 'Column ' + title + ' is not empty')
                    .and.notify(next);
            });
    });
};
