module.exports.config = {
    baseUrl: 'http://127.0.0.1:4242/index_dev.html',
    allScriptsTimeout: 11000,
    seleniumServerJar: 'node_modules/protractor/selenium/selenium-server-standalone-2.42.2.jar',

    specs: [
        'tests/features/**/*.feature'
    ],

    capabilities: {
        browserName: 'phantomjs'
    },

    framework: 'cucumber',

    cucumberOpts: {
        require: 'tests/features/definition.js',
        format: 'pretty'
    }
};
