var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('laboard homepage', function() {

  beforeEach(function() {
    browser.get('http://localhost:4242');
  });

  it('should have a title', function() {
    expect(browser.getTitle()).to.eventually.equal('Laboard');
  });
});