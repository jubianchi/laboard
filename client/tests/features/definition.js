var fs = require('fs');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var expect = chai.expect;

module.exports = function() {
    var ptor = protractor.getInstance(),
        iGoTo, iTypeIn, iClickOn, iAmOnLaboard;

    this.Before(function(next) {
        browser.manage().window().setSize(1024, 768);
        iAmOnLaboard(next);
    });

    this.Given(/^I am on laboard$/, iAmOnLaboard = function (next) {
        browser
            .get('#/')
            .then(next);
    });

    this.Given(/^user "([^"]*)" has token "([^"]*)"/, function(user, token, next) {
        browser
            .executeScript('mock.addUser(\'' + token + '\', \'' + user + '\');')
            .then(next);
    });

    this.Given(/^project "([^"]*)" exists in namespace "([^"]*)"/, function(project, namespace, next) {
        browser
            .executeScript('mock.addProject(\'' + namespace + '\', \'' + project + '\');')
            .then(next);
    });

    this.Given(/^project "([^"]*)" has column "([^"]*)"/, function(project, column, next) {
        browser
            .executeScript('mock.addColumn(\'' + project + '\', \'' + column + '\');')
            .then(next);
    });

    this.Given(/^I am "([^"]*)" on "([^"]*)"$/, function (role, project, next) {
        browser
            .executeScript('mock.setAccessLevel(\'' + project + '\', \'' + role + '\');')
            .then(next);
    });

    this.When(/^I go to "([^"]*)"/, iGoTo = function(url, next) {
        browser
            .navigate().to('#' + url)
            .then(next);
    });

    this.When(/I click on "([^"]*)" containing "([^"]*)"/, function(elem, text, next) {
        ptor.findElement(by.cssContainingText(elem, text))
            .click()
            .then(next);
    });

    this.When(/I click on "([^"]*)"$/, iClickOn = function(text, next) {
        var elements,
            fallback = function() {
                elements = by.cssContainingText('a,button,[type=button],[type=submit],[data-ng-click]', text);

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
    });

    this.When(/I type "([^"]*)" in "([^"]*)"$/, iTypeIn = function(text, element, next) {
        ptor.findElement(by.css(element))
            .sendKeys(text)
            .then(next);
    });

    this.When(/^I login with token "([^"]*)"$/, function(token, next) {
        iGoTo('/', function() {
            iTypeIn(token, '#password', function() {
                iClickOn('Login', next);
            })
        });
    });

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

    this.Then(/I should see a column with title "([^"]*)"$/, function(title, next) {
        var condition = function() {
            return ptor
                .findElement(by.cssContainingText('.column .panel-heading', title))
                .isDisplayed();
        };

        browser.wait(condition, 10, 'No column with title "' + title + '" seen after 10 seconds')
            .then(function() { next(); });
    });

    this.Then(/I should not see a column with title "([^"]*)"$/, function(title, next) {
        var condition = function() {
            return ptor
                .findElement(by.cssContainingText('.column .panel-heading', title))
                .isDisplayed();
        };

        browser.wait(condition, 10, 'No column with title "' + title + '" seen after 10 seconds')
            .then(
                function() { throw new Error('Column "' + title + '" was seen in page'); },
                function() { next(); }
            );
    });

    this.Then(/I should see a column with title "([^"]*)"$/, function(title, next) {
        var condition = function() {
            return ptor
                .findElement(by.cssContainingText('.column .panel-heading', title))
                .isDisplayed();
        };

        browser.wait(condition, 10, 'No column with title "' + title + '" seen after 10 seconds')
            .then(
                function() {
                    next();
                }
            );
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
