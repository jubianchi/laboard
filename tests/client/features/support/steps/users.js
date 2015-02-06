module.exports = function(cucumber) {
    browser.logout = function() {
        return browser.executeScript('mock.reset();');
    };

    cucumber.BeforeScenario(function(e, next) {
        browser.user = null;
        browser.users = {};

        next();
    });

    cucumber.Given(/^user "([^"]*)" has token "([^"]*)"/, function(user, token, next) {
        browser
            .executeScript('mock.addUser(\'' + token + '\', \'' + user + '\');')
            .then(function() {
                browser.users[token] = user;

                next();
            });
    });

    cucumber.Given(/^I am "([^"]*)" on project "([^"]*)"$/, function (role, project, next) {
        browser
            .executeScript('mock.setAccessLevel(\'' + project + '\', \'' + role + '\');')
            .then(next);
    });

    cucumber.Given(/^I am not "([^"]*)" on project "([^"]*)"$/, function (role, project, next) {
        var roles = [
            'guest',
            'reporter',
            'developer',
            'master',
            'owner'
        ];

        browser
            .executeScript('mock.setAccessLevel(\'' + project + '\', \'' + roles[roles.indexOf(role) - 1] + '\');')
            .then(next);
    });

    cucumber.When(/^I login with token "([^"]*)"$/, function(token, next) {
        browser.goTo('/').then(function() {
            browser.typeTextInElement(token, '#password')
                .then(function() {
                    browser.clickOn('Login').then(function() {
                        browser.user = browser.users[token];

                        next();
                    });
                });
        });
    });

    cucumber.When(/I open the user menu$/, function(next) {
        element(by.cssContainingText('.navbar-btn.dropdown-toggle', browser.user)).click().then(next);
    });
};
