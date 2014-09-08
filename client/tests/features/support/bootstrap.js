var chai = require('chai'),
    path = require('path'),
    fs = require('fs'),
    expect = chai.expect;

chai.use(require('chai-as-promised'));

module.exports = function() {
    var ptor = protractor.getInstance();

    require('./steps/projects.js')(this);
    require('./steps/columns.js')(this);
    require('./steps/users.js')(this);
    require('./steps/navigation.js')(this);
    require('./steps/interaction.js')(this);
    require('./steps/ui.js')(this);
    require('./screenshots.js')(this);

    browser.manage().window().setSize(1024, 768);

    this.Before(function(next) {
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
                var elements = by.cssContainingText('a,button,[type=button],[type=submit],[data-ng-click],label', text);

                element(elements)
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

    browser.typeTextInElement = function(text, elem, next) {
        element(by.css(elem))
            .sendKeys(text)
            .then(next);
    };

    this.Then(/I should be on "([^"]*)"/, function(url, next) {
        expect(ptor.getCurrentUrl())
            .to.eventually.match(new RegExp('#' + url + '$'))
            .and.notify(next);
    });
};
