module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    plugins: ['karma-firefox-launcher', 'karma-chrome-launcher', 'karma-phantomjs-launcher', 'karma-jasmine', 'karma-jasmine-html-reporter', 'karma-story-reporter', 'karma-coverage'],
    browsers: ['PhantomJS'],
    reporters: ['story', 'coverage', 'html'],

    files: [
      'public/assets/js/vendor.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'src/js/app.js',
      '../config/client.js-dist',
      'src/js/auth.js',
      'src/js/router.js',
      'src/js/**/*.js',
      'tests/**/*.js'
    ],

    preprocessors: {
        'src/js/directive/*.js': ['coverage'],
        'src/js/factory/*.js': ['coverage'],
        'src/js/modules/column/*.js': ['coverage'],
        'src/js/modules/issue/*.js': ['coverage'],
        'src/js/modules/project/*.js': ['coverage'],
        'src/js/modules/metrics/*.js': ['coverage'],
        'src/js/modules/login/*.js': ['coverage'],
        'src/js/modules/home/*.js': ['coverage']
    }
  });
};
