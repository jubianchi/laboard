var path = require('path'),
    fs = require('fs');

module.exports = function(cucumber) {
    var screenshotId = 0,
        screenshotDir = path.resolve(__dirname, '../../../../tmp/screenshots'),
        slugify = function(str) {
            return str
                .toLowerCase()
                .replace(/\s/g, '-')
                .replace(/[^\w-]+/g, '');
        },
        mkdir = function(dir) {
            try {
                if (fs.statSync(dir).isDirectory() === false) {
                    fs.mkdirSync(dir);
                }
            } catch (e) {
                fs.mkdirSync(dir);
            }
        },
        currentFeature,
        currentScenario,
        currentStep;

    mkdir(screenshotDir);

    cucumber.BeforeFeature(function(event, next) {
        currentFeature = slugify(event.getPayloadItem('feature').getName());

        next();
    });

    cucumber.BeforeScenario(function(event, next) {
        currentScenario = slugify(event.getPayloadItem('scenario').getName());

        next();
    });

    cucumber.AfterStep(function(event, next) {
        currentStep = slugify(event.getPayloadItem('step').getName());

        next();
    });

    cucumber.StepResult(function(event, next) {
        var result = event.getPayloadItem('stepResult'),
            dir = path.join(screenshotDir, currentFeature, currentScenario);

        if (result.isFailed()) {
            mkdir(path.join(screenshotDir, currentFeature));
            mkdir(dir);

            browser.takeScreenshot()
                .then(function (data) {
                    var filename = path.join(dir, (screenshotId++) + '-' + currentStep + '.png'),
                        stream = fs.createWriteStream(filename);

                    stream.write(new Buffer(data, 'base64'));
                    stream.end();

                    next();
                }, function() {});
        } else {
            next();
        }
    });
};
