module.exports = function(cucumber) {
    var ptor = protractor.getInstance();

    cucumber.Then(/I should see a column with title "([^"]*)"$/, function (title, next) {
        var condition = function () {
            return ptor
                .findElement(by.cssContainingText('.column .panel-heading', title))
                .isDisplayed();
        };

        browser.wait(condition, 10, 'No column with title "' + title + '" seen after 10 seconds')
            .then(
                function () {
                    next();
                }
            );
    });

    cucumber.Then(/I should not see a column with title "([^"]*)"$/, function (title, next) {
        var condition = function () {
            return ptor
                .findElement(by.cssContainingText('.column .panel-heading', title))
                .isDisplayed();
        };

        browser.wait(condition, 10, 'No column with title "' + title + '" seen after 10 seconds')
            .then(
                function () {
                    throw new Error('Column "' + title + '" was seen in page');
                },
                function () {
                    next();
                }
            );
    });
};
