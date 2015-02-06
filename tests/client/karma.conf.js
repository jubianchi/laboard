module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    plugins: ['karma-phantomjs-launcher', 'karma-chrome-launcher', 'karma-jasmine', 'karma-jasmine-html-reporter', 'karma-story-reporter', 'karma-coverage'],
    browsers: ['phantom', 'chrome'],
    reporters: ['story', 'coverage', 'html'],

    customLaunchers: {
      phantom: {
        base: 'PhantomJS',
        options: {
          viewportSize: {
            width: 1024,
            height: 768
          }
        }
      },
      chrome: {
        base: 'Chrome',
        options: {
          viewportSize: {
            width: 1024,
            height: 768
          }
        }
      }
    },

    files: [
      '../../client/public/assets/js/vendor.js',
      //'../../bower_components/angular-mocks/angular-mocks.js',
      '../../client/src/js/app.js',
      '../../config/client.js',
      '../../client/src/js/auth.js',
      '../../client/src/js/router.js',
      '../../client/src/js/**/*.js',
      'units/**/*.js'
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
    },

    coverageReporter: {
      type: 'html',
      dir: '../../tmp/coverage/'
    }
  });
};
