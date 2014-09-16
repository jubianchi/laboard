module.exports = function(cucumber) {
    browser.typeTextInElement = function(text, elem) {
        return element(by.css(elem)).sendKeys(text);
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

    cucumber.When(/I click on "([^"]*)"$/, function(text, next) {
        browser.clickOn(text, next);
    });

    cucumber.When(/I type "([^"]*)" in "([^"]*)"$/, function(text, element, next) {
        browser.typeTextInElement(text, element).then(next);
    });
};
