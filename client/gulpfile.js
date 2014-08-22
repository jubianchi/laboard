var gulp = require('gulp'),
    less = require('gulp-less'),
    watch = require('gulp-watch'),
    connect = require('gulp-connect'),
    concat = require('gulp-concat'),
    path = require('path'),
    prefix = require('gulp-autoprefixer'),
    templateCache = require('gulp-angular-templatecache'),
    exec = require('child_process').exec,
    http = require('http'),
    protractor = require("gulp-protractor").protractor,
    webdriver_update = require("gulp-protractor").webdriver_update;

gulp.task('font-awesome', function() {
    gulp.src('bower_components/font-awesome/fonts/*')
        .pipe(gulp.dest('public/assets/font'))
        .pipe(connect.reload());
});

gulp.task('bootstrap', function() {
    gulp.src('bower_components/bootstrap/fonts/*')
        .pipe(gulp.dest('public/assets/font'))
        .pipe(connect.reload());
});

var libs = [
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
gulp.task('libs', function(cb) {
    exec(
        'cd bower_components/node-semver && make semver.browser.js',
        function (err, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);

            gulp.src(libs)
                .pipe(concat('vendor.js'))
                .pipe(gulp.dest('public/assets/js'));

            gulp.src([
                'bower_components/font-awesome-animation/dist/font-awesome-animation.css',
                'bower_components/angular-loading-bar/build/loading-bar.css'
            ])
                .pipe(gulp.dest('public/assets/styles'));

            gulp.src([
                'bower_components/nyancat/nyancat.gif',
                'bower_components/nyancat/nyancat.mp3',
                'bower_components/nyancat/nyancat.ogg'
            ])
                .pipe(gulp.dest('public/assets'));

            cb(err);
        }
    );
});

gulp.task('less', function() {
    gulp.src('src/less/main.less')
        .pipe(less())
        .pipe(prefix({ cascade: true }))
        .pipe(gulp.dest('public/assets/styles'))
        .pipe(connect.reload());
});

gulp.task('cache', function() {
    gulp.src('src/js/modules/**/partials/**/*.html')
        .pipe(templateCache('templates.js', {
            module: 'laboard-frontend'
        }))
        .pipe(gulp.dest('tmp'))
        .pipe(connect.reload());
});

var js;
gulp.task('js', ['cache'], function() {
    gulp.src(js = ['src/js/**/*.js', '../config/client.js', 'tmp/templates.js'])
        .pipe(concat('app.js'))
        .pipe(gulp.dest('public/assets/js'))
        .pipe(connect.reload());
});

gulp.task('html', function() {
    gulp.src(['src/*.html'])
        .pipe(gulp.dest('public'))
        .pipe(connect.reload());
});

gulp.task('images', function() {
    gulp.src('src/images/**/*')
        .pipe(gulp.dest('public/assets/images'))
        .pipe(connect.reload());
});

gulp.task('vendor', ['font-awesome', 'bootstrap', 'libs']);
gulp.task('app', ['vendor', 'less', 'js', 'html', 'images']);

gulp.task('watch', ['server'], function() {
    var watched = {
        js: js.concat(['src/**/*.html']),
        libs: libs.concat(['bower_components/node-semver/semver.js']),
        less: ['src/less/**/*.less'],
        'font-awesome': ['bower_components/font-awesome/fonts/*'],
        bootstrap: ['bower_components/bootstrap/fonts/*'],
        html: ['src/**/*.html'],
        images: ['src/images/**/*']
    };

    Object.keys(watched).forEach(function(key) {
        gulp.watch(watched[key], [key]);
    });
});

gulp.task('server', connect.server({
    root: [path.resolve('public')],
    port: 4242,
    livereload: true,
    middleware: function(connect, opt) {
        var container = require('../server/container');

        require('../server');

        return [
            function(req, res, next) {
                container.get('app').handle(req, res, next);
            }
        ]
    }
}));

// Downloads the selenium webdriver
gulp.task('webdriver_update', webdriver_update);

gulp.task('protractor', ['webdriver_update'], function() {
  gulp.src(["./src/tests/*.js"])
    .pipe(protractor({
      configFile: "./tests/e2e/protractor-conf.js"
    }))
    .on('error', function(e) { throw e })
});

gulp.task('default', ['app', 'watch']);
