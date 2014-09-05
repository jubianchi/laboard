var chai = require('chai'),
    expect = chai.expect;

chai.use(require('chai-as-promised'));

module.exports = function() {
    var ptor = protractor.getInstance();

    require('./steps/projects.js')(this);
    require('./steps/columns.js')(this);
    require('./steps/users.js')(this);
    require('./steps/navigation.js')(this);
    require('./steps/interaction.js')(this);

    this.Before(function(next) {
        browser.manage().window().setSize(1024, 768);
        browser.goToHomepage(next);
    });

    browser.goToHomepage = function(next) {
        browser
            .get('#/')
            .then(next);
    };

    browser.goTo = function(url, next) {
        browser
            .navigate().to('#' + url)
            .then(next);
    };

    browser.clickOn = function(text, next) {
        var fallback = function() {
                var elements = by.cssContainingText('a,button,[type=button],[type=submit],[data-ng-click]', text);

                ptor.findElement(elements)
                    .click()
                    .then(next);
            };

        $$('[data-tooltip="' + text + '"],[value="' + text + '"]')
            .then(
                function(elements) {
                    if (elements.length === 0) {
                        fallback();
                    } else {
                        elements[0].click().then(next);
                    }
                },
                fallback
            );
    };

    browser.typeTextInElement = function(text, element, next) {
        ptor.findElement(by.css(element))
            .sendKeys(text)
            .then(next);
    };

    this.Then(/the title should be equal to "([^"]*)"$/, function(title, next) {
        expect(browser.getTitle())
            .to.eventually.equal(title)
            .and.notify(next);
    });

    this.Then(/I should see a "([^"]*)" element$/, function(element, next) {
        expect(ptor.findElement(by.css(element)).isDisplayed())
            .to.eventually.equal(true)
            .and.notify(next);
    });

    this.Then(/I should see a modal dialog$/, function(next) {
        var condition = function() {
            return ptor.findElement(by.css('.modal-dialog')).isDisplayed();
        };

        browser.wait(condition, 10, "No modal dialog seen after 10 seconds")
            .then(function() { next(); });
    });

    this.Then(/I should see "([^"]*)" in "([^"]*)"$/, function(text, element, next) {
        expect(ptor.findElement(by.css(element)).getText())
            .to.eventually.match(new RegExp(text))
            .and.notify(next);
    });

    this.Then(/I should see "([^"]*)"$/, function(text, next) {
        expect(ptor.findElement(by.css('body')).getText())
            .to.eventually.match(new RegExp(text))
            .and.notify(next);
    });

    this.Then(/I should be on "([^"]*)"/, function(url, next) {
        expect(ptor.getCurrentUrl())
            .to.eventually.match(new RegExp('#' + url + '$'))
            .and.notify(next);
    });
};
