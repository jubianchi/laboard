var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var expect = chai.expect;

module.exports = function() {
    var ptor = protractor.getInstance(),
        iGoTo, iTypeIn, iClick, iAmOnLaboard;

    this.Before(function(next) {
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

    this.When(/^I go to "([^"]*)"/, iGoTo = function(url, next) {
        browser
            .navigate().to('#' + url)
            .then(next);
    });

    this.When(/I click on "([^"]*)"/, iClick = function(button, next) {
        ptor.findElement(by.css(button))
            .click()
            .then(next);
    });

    this.When(/I click on "([^"]*)" containing "([^"]*)"/, function(elem, text, next) {
        ptor.findElement(by.cssContainingText(elem, text))
            .click()
            .then(next);
    });

    this.When(/I type "([^"]*)" in "([^"]*)"$/, iTypeIn = function(text, element, next) {
        ptor.findElement(by.css(element))
            .sendKeys(text)
            .then(next);
    });

    this.When(/^I login with token "([^"]*)"$/, function(token, next) {
        iGoTo('/', function() {
            iTypeIn(token, '#password', function() {
                iClick('[type=submit]', next);
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
