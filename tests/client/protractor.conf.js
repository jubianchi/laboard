module.exports.config = {
    baseUrl: 'http://127.0.0.1:4242/index_dev.html',
    getPageTimeout: 11000,
    allScriptsTimeout: 11000,
    seleniumServerJar: '../../node_modules/protractor/selenium/selenium-server-standalone-2.42.2.jar',
    rootElement: 'body',

    onPrepare: function() {
        browser.manage().window().setSize(1024, 768);
    },

    specs: [
        '../tests/features/**/*.feature'
    ],

    multiCapabilities: [
        {
            browserName: 'phantomjs',
            'phantomjs.binary.path': require('phantomjs').path
        },
        {
            'browserName': 'chrome'
        }
    ],

    framework: 'cucumber',

    cucumberOpts: {
        require: 'features/support/bootstrap.js',
        format: 'pretty'
    }
};
