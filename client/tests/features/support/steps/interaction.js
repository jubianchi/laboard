module.exports = function(cucumber) {
    cucumber.When(/I click on "([^"]*)"$/, function(text, next) {
        browser.clickOn(text, next);
    });

    cucumber.When(/I type "([^"]*)" in "([^"]*)"$/, function(text, element, next) {
        browser.typeTextInElement(text, element, next);
    });
};
