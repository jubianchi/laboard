module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    plugins: ['karma-chrome-launcher', 'karma-jasmine', 'karma-jasmine-html-reporter', 'karma-story-reporter', 'karma-coverage'],
    browsers: ['chrome'],
    reporters: ['story', 'coverage', 'html'],

    customLaunchers: {
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
      '../../client/public/assets/js/app.js',
      '../../client/public/assets/js/config.js',
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
