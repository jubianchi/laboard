var fs = require('fs');

module.exports = function(application) {
    application.config = require('../../config/server.json');

    if (fs.existsSync(application.config.data_dir) === false) {
        fs.mkdirSync(application.config.data_dir);
    }
};
