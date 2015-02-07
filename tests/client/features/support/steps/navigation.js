var chai = require('chai'),
    expect = chai.expect;

module.exports = function(cucumber) {
    browser.goToHomepage = function() {
        return browser.get('http://127.0.0.1:8080/index_dev.html');
    };

    browser.goTo = function(url) {
        return browser.navigate().to('http://127.0.0.1:8080/index_dev.html#' + url);
    };

    cucumber.Given(/^I am on laboard$/, function(next) {
        browser.goToHomepage().then(next);
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
