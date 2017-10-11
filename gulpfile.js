const gulp = require('gulp');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const pixrem = require('pixrem');
const autoprefixer = require('autoprefixer');
const concat = require('gulp-concat');
const browserify = require('gulp-browserify');
const babel = require('gulp-babel');
const bs = require('browser-sync');
const order = require('run-sequence');

const processlog = input => { console.log(`-=-=-=-=-=-=-=-=-=-=-=---> ${input}`) }

gulp.task('styles', () => {
    processlog('styles going!');
    return gulp.src('src/scss/**/style.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([
            autoprefixer({
                browsers: ['last 5 versions']
            }),
            pixrem()
        ])).pipe(concat('app.css'))
        .pipe(gulp.dest('dist/css'))
        .pipe(bs.stream());
});

gulp.task('js', () => {
    processlog('taskrunning js');
    return gulp.src('src/js/app.js')
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(concat('app.js'))
        .pipe(gulp.dest('dist/js'))
});
gulp.task('vendorJS', () => {
    processlog('taskrunning libs');
    return gulp.src('src/vendor/js/**/*')
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest('dist/js/'));
});
gulp.task('vendorCSS', () => {
    processlog('taskrunning css libs');
    return gulp.src('src/vendor/css/**/*')
        .pipe(concat('vendor.css'))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('assets', () => {
    processlog('Moving assets!');
    return gulp.src('src/assets/**/*')
        .pipe(gulp.dest('dist/assets'));
});

gulp.task('sync', () => {
    processlog('Serving files!');
    bs.init({
        server : {
            baseDir: './'
        }
    });

    gulp.watch('src/scss/**/*.scss', ['styles']);
    gulp.watch('src/js/**/*.js', ['js']);
    gulp.watch('src/vendor/js/**/*', ['vendorJS']);
    gulp.watch('src/vendor/css/**/*', ['vendorCSS']);
    gulp.watch('src/assets/**/*', ['assets']);

    gulp.watch('dist/**/*.js').on('change', bs.reload);
    gulp.watch('*.html').on('change', bs.reload);
});

gulp.task('default', order(['styles', 'vendorJS', 'vendorCSS', 'js', 'assets'], 'sync', function(){
    console.log('There you go :)');
}));