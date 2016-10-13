var gulp = require('gulp');
var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var merge = require('merge2');

var configFile = 'tsconfig.json';
var destFolder = 'lib';

gulp.task('scripts', function() {
    var project = ts.createProject(configFile);
    var result = project.src()
            .pipe(sourcemaps.init())
            .pipe(ts(project));
    return merge([
        result.js.pipe(sourcemaps.write('maps'))
            .pipe(gulp.dest(destFolder)),
        result.dts.pipe(gulp.dest(destFolder))
    ]);
});

gulp.task('bundle', function() {
    var project = ts.createProject(configFile, {
        module: 'system',
        out: 'ng-file-input.js'
    });

    var result = project.src()
            .pipe(sourcemaps.init())
            .pipe(ts(project));

    var minified = result.js.pipe(uglify()).pipe(sourcemaps.write('maps'));

    return merge([
        minified.pipe(gulp.dest(destFolder)),
        result.dts.pipe(gulp.dest(destFolder))
    ]);
});

gulp.task('clean', function() {
    var clean = require('gulp-clean');
    return gulp.src(destFolder, {read: false})
        .pipe(clean());

});

gulp.task('default', ['scripts', 'bundle']);
