var gulp = require('gulp'),
    less = require('gulp-less'),
    watch = require('gulp-watch'),
    concat = require('gulp-concat'),
    prefix = require('gulp-autoprefixer'),
    rename = require('gulp-rename'),
    uglify = function() {
        return require('gulp-uglify')({
            mangle: false
        })
    },
    cssmin = require('gulp-cssmin'),
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
            'client/src/js/app.js',
            'client/src/js/auth.js',
            'client/src/js/router.js',
            'client/src/js/directive/**/*.js',
            'client/src/js/factory/**/*.js',
            'client/src/js/filter/**/*.js',
            'client/src/js/modules/**/*.js',
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
        .pipe(gulp.dest(directories.assets.fonts));
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

            var src = gulp.src(files.libs).pipe(concat('vendor.js'));

            if (process.env.NODE_ENV === 'production') {
                src = src.pipe(uglify());
            }

            src.pipe(gulp.dest(directories.assets.js));

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
    var src = gulp.src(files.css).pipe(concat('vendor.css'));

    if (process.env.NODE_ENV === 'production') {
        src = src.pipe(cssmin());
    }

    src.pipe(gulp.dest(directories.assets.css));
});

gulp.task('less', function() {
    var src = gulp.src(files.less)
        .pipe(less())
        .pipe(prefix({ cascade: true }))

    if (process.env.NODE_ENV === 'production') {
        src = src.pipe(cssmin());
    }

    src.pipe(gulp.dest(directories.assets.css));
});

gulp.task('js', ['config:client'], function() {
    var src = gulp.src(['config/client.js']).pipe(rename('config.js'));

    if (process.env.NODE_ENV === 'production') {
        src = src.pipe(uglify());
    }

    src.pipe(gulp.dest(directories.assets.js));

    gulp.src(files.cache)
        .pipe(templateCache('templates.js', { module: 'laboard-frontend' }))
        .pipe(gulp.dest(directories.tmp))
        .on('end', function() {
            var src = gulp.src(files.js).pipe(concat('app.js'));

            if (process.env.NODE_ENV === 'production') {
                src = src.pipe(uglify());
            }

            src.pipe(gulp.dest(directories.assets.js));
        })
});

gulp.task('html', function() {
    gulp.src(files.html)
        .pipe(gulp.dest(directories.public));
});

gulp.task('config:client', function(cb) {
    if (!fs.existsSync('config/client.js')) {
        var src = gulp.src('config/client.js-dist').pipe(rename('client.js'));

        if (process.env.NODE_ENV === 'production') {
            src = src.pipe(uglify());
        }

        src
            .pipe(gulp.dest('config'))
            .on('end', cb);
    } else {
        cb();
    }
});

gulp.task('config:server', function(cb) {
    if (!fs.existsSync('config/server.js')) {
        gulp.src('config/server.js-dist')
            .pipe(rename('server.js'))
            .pipe(gulp.dest('config'))
            .on('end', cb);
    } else {
        cb();
    }
});

gulp.task('webdriver', webdriver);

gulp.task('cs', function() {
    return gulp.src([
            'client/src/js/**/*.js',
            'tests/**/*.js',
            'server/**/*.js',
            'gulpfile.js'
        ])
        .pipe(jscs(__dirname + '/.jscsrc'));
});

gulp.task('karma', function(done) {
    return karma.start(
        {
            configFile: __dirname + '/tests/client/karma.conf.js',
            autoWatch: false,
            singleRun: true
        },
        done
    );
});

gulp.task('protractor', ['webdriver'], function(done) {
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

        fonts: files.fonts,
        libs: files.libs.concat(['bower_components/node-semver/semver.js']),
        css: files.css,

        less: 'client/src/less/**/*.less',
        js: files.js.concat(files.cache),
        html: files.html
    };

    Object.keys(watched).forEach(function(key) {
        gulp.watch(watched[key], [key]);
    });
});

gulp.task('server', ['app'], function() {
    var container = require('./server/container');

    container.get('app').use(container.get('static'));

    try {
        container.get('server');
    } catch (e) {}
});

gulp.task('config', ['config:client', 'config:server']);
gulp.task('vendor', ['fonts', 'libs', 'css']);
gulp.task('app', ['config', 'vendor', 'less', 'js', 'html']);
gulp.task('test', ['cs', 'app', 'atoum', 'karma', 'protractor']);
gulp.task('default', ['server', 'watch']);
