var gulp = require('gulp'),
    less = require('gulp-less'),
    watch = require('gulp-watch'),
    connect = require('gulp-connect'),
    concat = require('gulp-concat'),
    path = require('path'),
    prefix = require('gulp-autoprefixer'),
    template = require('gulp-template'),
    data = require('gulp-data'),
    rename = require('gulp-rename'),
    prompt = require('gulp-prompt'),
    templateCache = require('gulp-angular-templatecache'),
    jscs = require('gulp-jscs'),
    karma = require('karma').server,
    exec = require('child_process').exec,
    http = require('http'),
    protractor = require("gulp-protractor").protractor,
    webdriver = require("gulp-protractor").webdriver_update,
    fs = require('fs'),
    files = {
        fonts: [
            'bower_components/font-awesome/fonts/*',
            'bower_components/bootstrap/fonts/*'
        ],

        libs: [
            'bower_components/es5-shim/es5-shim.js',
            'bower_components/jquery/dist/jquery.js',
            'bower_components/lodash/dist/lodash.js',
            'bower_components/marked/lib/marked.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-route/angular-route.js',
            'bower_components/angular-ui-router/release/angular-ui-router.js',
            'bower_components/restangular/dist/restangular.js',
            'bower_components/angular-gravatar/build/md5.js',
            'bower_components/angular-gravatar/build/angular-gravatar.js',
            'bower_components/angular-loading-bar/build/loading-bar.js',
            'bower_components/angular-marked/angular-marked.js',
            'bower_components/moment/moment.js',
            'bower_components/authenticateJS/build/authenticate.js',
            'bower_components/bootstrap/dist/js/bootstrap.js',
            'bower_components/angular-draggable/ngDraggable.js',
            'bower_components/angular-bootstrap/ui-bootstrap.js',
            'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
            'bower_components/socket.io-client/socket.io.js',
            'bower_components/node-semver/semver.browser.js',
            'bower_components/highcharts/highcharts-all.js',
            'bower_components/highcharts-ng/dist/highcharts-ng.js',
            'bower_components/highlightjs/highlight.pack.js'
        ],

        js: [
            'client/src/js/**/*.js',
            'data/tmp/templates.js'
        ],

        css: [
            'bower_components/font-awesome-animation/dist/font-awesome-animation.css',
            'bower_components/angular-loading-bar/build/loading-bar.css',
            'bower_components/highlightjs/styles/default.css',
            'bower_components/highlightjs/styles/github.css'
        ],

        less: [
            'client/src/less/main.less'
        ],

        cache: [
            'client/src/js/modules/**/partials/**/*.html'
        ],

        html: [
            'client/src/index.html'
        ]
    },
    directories = {
        assets: {
            fonts: 'client/public/assets/font',
            js: 'client/public/assets/js',
            css: 'client/public/assets/styles'
        },
        tmp: 'data/tmp',
        public: 'client/public'
    };

if (process.env.NODE_ENV === 'test') {
    files.libs.push('bower_components/angular-mocks/angular-mocks.js');
    files.js.push('client/src/app_test.js');
    files.html = 'client/src/index_test.html';
}

gulp.task('fonts', function() {
    gulp.src(files.fonts)
        .pipe(gulp.dest(directories.assets.fonts))
        .pipe(connect.reload());
});

gulp.task('libs', function(cb) {
    exec(
        'cd bower_components/node-semver && ( cat head.js.txt; cat semver.js | egrep -v \'^ *\\/\\* nomin \\*\\/\' | perl -pi -e \'s/debug\\([^\\)]+\\)//g\'; cat foot.js.txt ) > semver.browser.js',
        function (err, stdout, stderr) {
            if (stdout) {
                console.log(stdout);
            }

            if (stderr) {
                console.log(stderr);
            }

            gulp.src(files.libs)
                .pipe(concat('vendor.js'))
                .pipe(gulp.dest(directories.assets.js));

            gulp.src([
                'bower_components/nyancat/nyancat.gif',
                'bower_components/nyancat/nyancat.mp3',
                'bower_components/nyancat/nyancat.ogg'
            ])
                .pipe(gulp.dest('client/public/assets'));

            cb(err);
        }
    );
});

gulp.task('css', function() {
    gulp.src(files.css)
        .pipe(concat('vendor.css'))
        .pipe(gulp.dest(directories.assets.css));
});

gulp.task('less', function() {
    gulp.src(files.less)
        .pipe(less())
        .pipe(prefix({ cascade: true }))
        .pipe(gulp.dest(directories.assets.css))
        .pipe(connect.reload());
});

gulp.task('cache', function() {
    gulp.src(files.cache)
        .pipe(templateCache('templates.js', { module: 'laboard-frontend' }))
        .pipe(gulp.dest(directories.tmp))
        .pipe(connect.reload());
});

gulp.task('js', ['config', 'cache'], function() {
    gulp.src(['config/client.js'])
        .pipe(rename('config.js'))
        .pipe(gulp.dest(directories.assets.js))
        .pipe(connect.reload());

    gulp.src(files.js)
        .pipe(concat('app.js'))
        .pipe(gulp.dest(directories.assets.js))
        .pipe(connect.reload());
});

gulp.task('html', function() {
    gulp.src(files.html)
        .pipe(gulp.dest(directories.public))
        .pipe(connect.reload());
});

gulp.task('cs', function() {
    return gulp.src([
            'client/src/js/**/*.js',
            'tests/**/*.js',
            'server/**/*.js',
            'gulpfile.js'
        ])
        .pipe(jscs(__dirname + '/.jscsrc'));
});

gulp.task('karma', ['libs'], function(done) {
    return karma.start(
        {
            configFile: __dirname + '/tests/client/karma.conf.js',
            autoWatch: false,
            singleRun: true
        },
        done
    );
});

gulp.task('webdriver', webdriver);

gulp.task('protractor', ['app', 'webdriver'], function(done) {
    gulp.src(['./tests/client/features/**/*.feature'])
        .pipe(protractor({
            configFile: __dirname + '/tests/client/protractor.conf.js'
        }))
        .on('error', function(e) { throw e; })
        .on('end', function() { done(); })
});

gulp.task('atoum', function(cb) {
    exec(
        'node_modules/atoum.js/bin/atoum -d tests/server --coverage --coverage-dir server',
        function (err, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);

            cb(err);
        }
    );
});

gulp.task('config:server', function(cb) {
    if (fs.existsSync('config/server.json')) {
        cb();

        return;
    }

    var src = gulp.src('config/server.json-dist'),
        defaults = {
            gitlabUrl: process.env.GITLAB_URL || 'https://gitlab.com',
            serverPort: process.env.LABOARD_PORT || 4343,
            gitlabVersion: process.env.GITLAB_VERSION || '7.4'
        };

    if (process.stdin.isTTY) {
        var vars;

        src
            .pipe(prompt.prompt(
                [
                    {
                        type: 'input',
                        name: 'gitlabUrl',
                        message: '[SEVRER] Url of your Gitlab instance',
                        default: defaults.gitlabUrl
                    },
                    {
                        type: 'list',
                        name: 'gitlabVersion',
                        message: '[SEVRER] Version of your Gitlab instance',
                        choices: ['7.2', '7.3', '7.4'],
                        default: defaults.gitlabVersion,
                        validate: function (values) {
                            return values.length === 1;
                        }
                    },
                    {
                        type: 'input',
                        name: 'serverPort',
                        message: '[SEVRER] Laboard server port',
                        default: defaults.serverPort,
                        validate: function (value) {
                            return parseInt(value, 10) > 0;
                        }
                    }
                ],
                function (res) {
                    vars = res;
                }
            ))
            .pipe(data(function () {
                return vars;
            }))
            .pipe(template())
            .pipe(rename('server.json'))
            .pipe(gulp.dest('config'))
            .on('end', cb);
    } else {
        src
            .pipe(template({
                gitlabUrl: defaults.gitlabUrl,
                gitlabVersion: defaults.gitlabVersion,
                serverPort: defaults.serverPort
            }))
            .pipe(rename('server.json'))
            .pipe(gulp.dest('config'))
            .on('end', cb);
    }
});

gulp.task('config:client', ['config:server'], function(cb) {
    if (fs.existsSync('config/client.js')) {
        cb();

        return;
    }

    var defaults = require('./config/server.json'),
        src = gulp.src('config/client.js-dist');

    defaults.gitlab_url = process.env.GITLAB_URL || defaults.gitlab_url;
    defaults.port = process.env.LABOARD_PORT || defaults.port;

    if (process.stdin.isTTY) {
        var vars;

        src
            .pipe(prompt.prompt(
                [
                    {
                        type: 'input',
                        name: 'gitlabUrl',
                        message: '[CLIENT] Url of your Gitlab instance',
                        default: defaults.gitlab_url || 'https://gitlab.com'
                    },
                    {
                        type: 'input',
                        name: 'serverPort',
                        message: '[CLIENT] Laboard server port',
                        default: defaults.port || 4343,
                        validate: function (value) {
                            return parseInt(value, 10) > 0;
                        }
                    }
                ],
                function (res) {
                    vars = res;
                }
            ))
            .pipe(data(function () {
                return vars;
            }))
            .pipe(template())
            .pipe(rename('client.js'))
            .pipe(gulp.dest('config'))
            .on('end', cb);
    } else {
        src
            .pipe(template({
                gitlabUrl: defaults.gitlab_url,
                serverPort: defaults.port
            }))
            .pipe(rename('client.js'))
            .pipe(gulp.dest('config'))
            .on('end', cb);
    }
});

gulp.task('vendor', ['fonts', 'libs', 'css']);
gulp.task('config', ['config:server', 'config:client']);
gulp.task('app', ['config', 'vendor', 'less', 'js', 'html']);

gulp.task('test', ['config', 'cs', 'atoum', 'karma', 'protractor']);

gulp.task('gulp', function(cb) {
    var childGulp,
        spawn = function() {
            if (childGulp) {
                childGulp.kill();
            }

            childGulp = require('child_process').spawn(
                'gulp',
                Array.prototype.slice.call(process.argv, 2),
                {
                    stdio: 'inherit'
                }
            );

            cb();
        };

    spawn();
});

gulp.task('watch', function() {
    var watched = {
        gulp: 'gulpfile.js',
        js: js.concat(['client/src/**/*.html']),
        libs: libs.concat(['bower_components/node-semver/semver.js']),
        less: ['client/src/less/**/*.less'],
        fonts: ['bower_components/font-awesome/fonts/*', 'bower_components/bootstrap/fonts/*'],
        html: ['client/src/**/*.html']
    };

    Object.keys(watched).forEach(function(key) {
        gulp.watch(watched[key], [key]);
    });
});

gulp.task('server', ['app'], function() {
    connect.server({
        root: [path.resolve('client/public')],
        port: 4242,
        livereload: true,
        middleware: function(connect, opt) {
            var container = require('./server/container');

            require('./bin/server');

            return [
                function(req, res, next) {
                    container.get('app').handle(req, res, next);
                }
            ]
        }
    })
});

gulp.task('default', ['app', 'server', 'watch']);
