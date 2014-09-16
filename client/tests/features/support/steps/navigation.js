var chai = require('chai'),
    expect = chai.expect;

module.exports = function(cucumber) {
    browser.goToHomepage = function() {
        return browser.get('#/').then(function() {
            return browser.navigate().refresh();
        });
    };

    browser.goTo = function(url) {
        return browser.navigate().to('#' + url);
    };

    cucumber.Given(/^I am on laboard$/, function(next) {
        browser.goToHomepage(next);
    });

    cucumber.When(/^I go to laboard$/, function(next) {
        browser.goTo('/').then(next);
    });

    cucumber.When(/^I go to "([^"]*)"/, function(url, next) {
        browser.goTo(url).then(next);
    });

    cucumber.Then(/I should be on "([^"]*)"/, function(url, next) {
        expect(protractor.getInstance().getCurrentUrl())
            .to.eventually.match(new RegExp('#' + url + '$'))
            .and.notify(next);
    });
};
