exports.config = {
  seleniumServerJar: '../../node_modules/protractor/selenium/selenium-server-standalone-2.42.2.jar', // Make use you check the version in the folder
  specs: ['spec.js'],
  multiCapabilities: [{
    browserName: 'firefox'
  }],
  framework: 'mocha',
  mochaOpts: {
    reporter: "spec",
    slow: 3000,
    timeout: 30000
  }
}