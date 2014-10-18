module.exports.config = {
    baseUrl: 'http://127.0.0.1:4242/index_dev.html',
    getPageTimeout: 11000,
    allScriptsTimeout: 11000,
    seleniumServerJar: 'node_modules/gulp-protractor/node_modules/protractor/selenium/selenium-server-standalone-2.43.1.jar',

    specs: [
        'tests/features/**/*.feature'
    ],

    capabilities: {
        browserName: 'phantomjs',
        'phantomjs.binary.path': require('phantomjs').path,
    },

    framework: 'cucumber',

    cucumberOpts: {
        require: 'tests/features/support/bootstrap.js',
        format: 'pretty'
    }
};
