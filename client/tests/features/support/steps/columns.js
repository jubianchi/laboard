var chai = require('chai'),
    expect = chai.expect;

module.exports = function(cucumber) {
    var ptor = protractor.getInstance();

    browser.findColumn = function(title, callback) {
        var condition = function () {
            return element(by.cssContainingText('.column .panel-heading', title))
                .isDisplayed();
        };

        browser.wait(condition, 10, 'No column with title "' + title + '" seen after 10 seconds')
            .then(function() {
                callback(element(by.cssContainingText('.column .panel-heading', title))
                    .element(by.xpath('ancestor::div[1]')));
            });
    };

    browser.findColumnMenu = function(title, callback) {
        browser.findColumn(title, function(column) {
            callback(column.element(by.css('.panel-heading .dropdown-menu')));
        });
    };

    cucumber.When(/^I open the menu of the "([^"]*)" column$/, function(title, next) {
        browser.findColumn(title, function(column) {
            column.element(by.css('[data-toggle=dropdown]'))
                .click()
                .then(next);
        });
    });

    cucumber.When(/^I click on "([^"]*)" in the menu of the "([^"]*)" column$/, function(text, title, next) {
        browser.findColumnMenu(title, function(menu) {
            menu.element(by.cssContainingText('a', text))
                .click()
                .then(next);
        });
    });

    cucumber.Then(/I should see the "([^"]*)" column$/, function(title, next) {
        browser.findColumn(title, function() {
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
        var condition = function () {
            return element(by.cssContainingText('.column .panel-heading', title))
                .isDisplayed();
        };

        browser.wait(condition, 10, 'No column with title "' + title + '" seen after 10 seconds')
            .then(
                function () {
                    next(new Error('Column "' + title + '" was seen in page'));
                },
                function () {
                    next();
                }
            );
    });

    cucumber.Then(/the "([^"]*)" column should have the "([^"]*)" theme$/, function(title, theme, next) {
        browser.findColumn(title, function(column) {
            expect(column.getAttribute('class')).to.eventually.contain(theme).and.notify(next);
        });
    });
};
