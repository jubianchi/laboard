var chai = require('chai'),
    expect = chai.expect;

module.exports = function(cucumber) {
    var ptor = protractor.getInstance();

    cucumber.Then(/the title should be equal to "([^"]*)"$/, function(title, next) {
        expect(browser.getTitle())
            .to.eventually.equal(title)
            .and.notify(next);
    });

    cucumber.Then(/I should see a "([^"]*)" element$/, function(elem, next) {
        expect(element(by.css(elem)).isDisplayed())
            .to.eventually.equal(true)
            .and.notify(next);
    });

    cucumber.Then(/I should see "([^"]*)" in "([^"]*)"$/, function(text, elem, next) {
        expect(element(by.css(elem)).getText())
            .to.eventually.match(new RegExp(text))
            .and.notify(next);
    });

    cucumber.Then(/I should see "([^"]*)"$/, function(text, next) {
        expect(element(by.css('body')).getText())
            .to.eventually.match(new RegExp(text))
            .and.notify(next);
    });

    cucumber.Then(/I should not see "([^"]*)"$/, function(text, next) {
        expect(element(by.css('body')).getText())
            .not.to.eventually.match(new RegExp(text))
            .and.notify(next);
    });

    cucumber.Then(/I should see a modal dialog$/, function(next) {
        var condition = function() {
            return element(by.css('.modal-dialog')).isDisplayed();
        };

        browser.wait(condition, 10, "No modal dialog seen after 10 seconds")
            .then(function() { next(); });
    });
};
