module.exports = function(cucumber) {
    cucumber.Given(/^I am on laboard$/, function(next) {
        browser.goToHomepage(next);
    });

    cucumber.When(/^I go to laboard$/, function(next) {
        browser.goTo('/', next);
    });

    cucumber.When(/^I go to "([^"]*)"/, function(url, next) {
        browser
            .navigate().to('#' + url)
            .then(next);
    });
};
