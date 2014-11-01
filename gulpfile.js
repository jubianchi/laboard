var gulp = require('gulp'),
    less = require('gulp-less'),
    watch = require('gulp-watch'),
    connect = require('gulp-connect'),
    concat = require('gulp-concat'),
    path = require('path'),
    prefix = require('gulp-autoprefixer'),
    templateCache = require('gulp-angular-templatecache'),
    jscs = require('gulp-jscs'),
    karma = require('karma').server,
    exec = require('child_process').exec,
    http = require('http'),
    protractor = require("gulp-protractor").protractor,
    webdriver = require("gulp-protractor").webdriver_update;

gulp.task('font-awesome', function() {
    gulp.src('bower_components/font-awesome/fonts/*')
        .pipe(gulp.dest('client/public/assets/font'))
        .pipe(connect.reload());
});

gulp.task('bootstrap', function() {
    gulp.src('bower_components/bootstrap/fonts/*')
        .pipe(gulp.dest('client/public/assets/font'))
        .pipe(connect.reload());
});

var libs = [
    'bower_components/es5-shim/es5-shim.js',
    'bower_components/jquery/dist/jquery.js',
    'bower_components/lodash/dist/lodash.js',
    'bower_components/angular/angular.js',
    'bower_components/angular-route/angular-route.js',
    'bower_components/angular-ui-router/release/angular-ui-router.js',
    'bower_components/restangular/dist/restangular.js',
    'bower_components/angular-gravatar/build/md5.js',
    'bower_components/angular-gravatar/build/angular-gravatar.js',
    'bower_components/angular-loading-bar/build/loading-bar.js',
    'bower_components/moment/moment.js',
    'bower_components/authenticateJS/build/authenticate.js',
    'bower_components/bootstrap/dist/js/bootstrap.js',
    'bower_components/angular-draggable/ngDraggable.js',
    'bower_components/angular-bootstrap/ui-bootstrap.js',
    'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
    'bower_components/socket.io-client/socket.io.js',
    'bower_components/node-semver/semver.browser.js',
    'bower_components/highcharts/highcharts-all.js',
    'bower_components/highcharts-ng/dist/highcharts-ng.js'
];
gulp.task('libs:mock', function() {
    libs.push('bower_components/angular-mocks/angular-mocks.js');
});

gulp.task('libs', function(cb) {
    exec(
        'cd bower_components/node-semver && make semver.browser.js',
        function (err, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);

            gulp.src(libs)
                .pipe(concat('vendor.js'))
                .pipe(gulp.dest('client/public/assets/js'));

            gulp.src([
                'bower_components/font-awesome-animation/dist/font-awesome-animation.css',
                'bower_components/angular-loading-bar/build/loading-bar.css'
            ])
                .pipe(gulp.dest('client/public/assets/styles'));

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

gulp.task('libs:dev', ['libs:mock', 'libs']);

gulp.task('less', function() {
    gulp.src('client/src/less/main.less')
        .pipe(less())
        .pipe(prefix({ cascade: true }))
        .pipe(gulp.dest('client/public/assets/styles'))
        .pipe(connect.reload());
});

gulp.task('cache', function() {
    gulp.src('client/src/js/modules/**/partials/**/*.html')
        .pipe(templateCache('templates.js', {
            module: 'laboard-frontend'
        }))
        .pipe(gulp.dest('tmp'))
        .pipe(connect.reload());
});

var js = [
    'client/src/js/**/*.js',
    'config/client.js',
    'tmp/templates.js'
];

gulp.task('js:mock', function() {
    js.push('client/src/app_dev.js');
});

gulp.task('js', ['cache'], function() {
    gulp.src(js)
        .pipe(concat('app.js'))
        .pipe(gulp.dest('client/public/assets/js'))
        .pipe(connect.reload());
});

gulp.task('js:dev', ['js:mock', 'js']);

gulp.task('html', function() {
    gulp.src(['client/src/*.html'])
        .pipe(gulp.dest('client/public'))
        .pipe(connect.reload());
});

gulp.task('images', function() {
    gulp.src('client/src/images/**/*')
        .pipe(gulp.dest('client/public/assets/images'))
        .pipe(connect.reload());
});

gulp.task('cs', function() {
    return gulp.src(['client/src/js/**/*.js', 'config/client.js-dist', 'tests/**/*.js', 'server/**/*.js'])
        .pipe(jscs(__dirname + '/.jscsrc'));
});

var autoWatch = true;
gulp.task('karma', ['libs:dev'], function(done) {
    return karma.start(
        {
            configFile: __dirname + '/tests/client/karma.conf.js',
            autoWatch: autoWatch,
            singleRun: !autoWatch
        },
        done
    );
});

gulp.task('karma:ci', function() {
    autoWatch = false;
});

gulp.task('webdriver', webdriver);

gulp.task('protractor', ['app:dev', 'webdriver'], function(done) {
    gulp.src(['./tests/client/features/**/*search*.feature'])
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

gulp.task('test', ['cs', 'atoum', 'karma:ci', 'karma', 'protractor']);
gulp.task('vendor', ['font-awesome', 'bootstrap', 'libs']);
gulp.task('vendor:dev', ['font-awesome', 'bootstrap', 'libs:dev']);
gulp.task('app', ['vendor', 'less', 'js', 'html', 'images']);
gulp.task('app:dev', ['vendor:dev', 'less', 'js:dev', 'html', 'images']);

gulp.task('watch', ['server'], function() {
    var watched = {
        js: js.concat(['client/src/**/*.html']),
        libs: libs.concat(['bower_components/node-semver/semver.js']),
        less: ['client/src/less/**/*.less'],
        'font-awesome': ['bower_components/font-awesome/fonts/*'],
        bootstrap: ['bower_components/bootstrap/fonts/*'],
        html: ['client/src/**/*.html'],
        images: ['client/src/images/**/*']
    };

    Object.keys(watched).forEach(function(key) {
        gulp.watch(watched[key], [key]);
    });
});

gulp.task('server', ['app:dev'], function() {
    connect.server({
        root: [path.resolve('client/public')],
        port: 4242,
        livereload: true,
        middleware: function(connect, opt) {
            var container = require('./server/container');

            require('./server');

            return [
                function(req, res, next) {
                    container.get('app').handle(req, res, next);
                }
            ]
        }
    })
});

gulp.task('default', ['app:dev', 'watch']);
