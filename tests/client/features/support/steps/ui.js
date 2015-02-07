var chai = require('chai'),
    expect = chai.expect;

module.exports = function(cucumber) {
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

    cucumber.Then(/I should not see a "([^"]*)" element$/, function(elem, next) {
        expect(element(by.css(elem)).isDisplayed())
            .not.to.eventually.equal(true)
            .and.notify(next);
    });

    cucumber.Then(/I should see a "([^"]*)" button/, function(text, next) {
        expect(element(by.buttonText(text)).isDisplayed())
            .to.eventually.equal(true)
            .and.notify(next);
    });

    cucumber.Then(/I should see "([^"]*)" in "([^"]*)"$/, function(text, elem, next) {
        expect(element(by.css(elem)).getText())
            .to.eventually.match(new RegExp(text))
            .and.notify(next);
    });

    cucumber.Then(/I should not see "([^"]*)" in "([^"]*)"$/, function(text, elem, next) {
        expect(element(by.css(elem)).getText())
            .not.to.eventually.match(new RegExp(text))
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

    cucumber.When(/I close the modal dialog$/, function(next) {
        browser.actions().sendKeys(protractor.Key.ESCAPE).perform().then(next);
    });

    cucumber.Then(/I should see a modal dialog with title "([^"]*)"/, function(text, next) {
        var modal,
            condition = function() {
                modal = element(by.css('.modal-dialog'));

                return modal.isDisplayed();
            };

        browser.wait(condition, 10, "No modal dialog seen after 10 seconds")
            .then(function() {
                expect(modal.element(by.cssContainingText('.modal-header', text)).isDisplayed())
                    .to.eventually.equal(true)
                    .and.notify(next);
            });
    });

    cucumber.Then(/I should see a "([^"]*)" field$/, function(text, next) {
        expect(element(by.cssContainingText('label', text)).isDisplayed())
            .to.eventually.equal(true)
            .and.notify(function() {
                element(by.cssContainingText('label', text)).then(function(label) {
                    label.getAttribute('for').then(function(attr) {
                        expect(element(by.css('input#' + attr)).isDisplayed())
                            .to.eventually.equal(true)
                            .and.notify(next);
                    });
                });
            });
    });
};
