var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('laboard homepage', function() {
  var ptor;

  beforeEach(function() {
    browser.get('http://localhost:4242');
    ptor = protractor.getInstance();
  });

  it('should have the laboard title', function() {
    expect(browser.getTitle()).to.eventually.equal('Laboard');
  });

  it('should be redirected to the login page', function() {
    ptor.getCurrentUrl().then(function(currentUrl) {
      expect(currentUrl).to.match(/\/login/);
    });
  });

  it('should be show the login form', function() {
    expect(element(by.id('password')).isDisplayed()).to.eventually.equal(true);
  });
});