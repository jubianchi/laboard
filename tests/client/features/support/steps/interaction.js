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

    browser.focusOn = function(locator, next) {
        $$(locator)
            .then(
                function(elements) {
                    if (elements.length === 0) {
                        fallback();
                    } else {
                        elements[0].click().then(next);
                    }
                }
            );
    };

    cucumber.When(/I click on "([^"]*)"$/, function(text, next) {
        browser.clickOn(text, next);
    });

    cucumber.When(/I focus on "([^"]*)"$/, function(text, next) {
        browser.focusOn(text, next);
    });

    cucumber.When(/I type "([^"]*)" in "([^"]*)"$/, function(text, element, next) {
        browser.typeTextInElement(text, element).then(next);
    });

    cucumber.When(/I search for "([^"]*)"$/, function(text, next) {
        $$('.navbar-form input')
            .then(
                function(elements) {
                    if (elements.length > 0) {
                        elements[0].clear();
                    }

                    browser.typeTextInElement(text, '.navbar-form input').then(next);
                }
            );
    });
};
