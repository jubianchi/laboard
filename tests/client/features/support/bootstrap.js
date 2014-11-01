var chai = require('chai'),
    expect = chai.expect;

chai.use(require('chai-as-promised'));

module.exports = function() {
    require('./steps/projects.js')(this);
    require('./steps/columns.js')(this);
    require('./steps/issues.js')(this);
    require('./steps/users.js')(this);
    require('./steps/navigation.js')(this);
    require('./steps/interaction.js')(this);
    require('./steps/ui.js')(this);
    require('./screenshots.js')(this);

    browser.manage().window().setSize(1024, 768);

    this.BeforeScenario(function(e, next) {
        browser.goToHomepage().then(next);
    });

    this.AfterScenario(function (e, next) {
        browser.logout().then(next);
    });
};
