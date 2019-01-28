const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const csscomb = require('gulp-csscomb');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const pug = require('gulp-pug');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const fs = require('fs');
const data = require('gulp-data');
const path = require('path');
const json = JSON.parse(fs.readFileSync('./config.json'));
const browserSync = require('browser-sync');
const connectSSI = require('connect-ssi');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config');

// pug
gulp.task('pug', () => {
	const locals = {
		'site': JSON.parse(fs.readFileSync('./config.json'))
	}
	return gulp.src(json.paths.src + 'pug/**/[^_]*.pug')
	.pipe(plumber({
		errorHandler: notify.onError('<%= error.message %>')
	}))
	.pipe(data(function(file) {
		locals.relativePath = path.relative(file.base, file.path.replace(/.pug$/, '.html'));
		  return locals;
	}))
	.pipe(pug({
		locals: locals,
		pretty: true,
		basedir: 'src/pug'
	}))
	.pipe(gulp.dest(json.paths.dest));
});

// sass
gulp.task('sass', () => {
	return gulp.src(json.paths.src + 'scss/**/*.scss')
		.pipe(plumber({
			errorHandler: notify.onError('<%= error.message %>')
		}))
		.pipe(sourcemaps.init())
		.pipe(sass({
			style: 'expanded'
		}))
		.pipe(sourcemaps.write({
			includeContent: false
		}))
		.pipe(sourcemaps.init({
			loadMaps: true
		}))
		.pipe(autoprefixer({
			browsers: ['last 2 versions', 'iOS >= 8.1', 'Android >= 4.4'],
			cascade: false
		}))
		.pipe(csscomb())
		.pipe(gulp.dest(json.paths.dest + json.paths.assets + 'css/'))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(cleanCSS())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(json.paths.dest + json.paths.assets + 'css/'))
		.pipe(browserSync.stream());
});

// js
gulp.task('webpack', () => {
	return webpackStream(webpackConfig, webpack)
		.pipe(gulp.dest(json.paths.dest + json.paths.assets + 'js/'));
});

// img tasks
gulp.task('initialize', () => {
	return del([json.paths.dest + json.paths.assets + 'img/']);
});
gulp.task('img', () => {
	return gulp.src([json.paths.src + 'img/**/*.{png,jpg,gif,svg}'])
		.pipe(gulp.dest(json.paths.dest + json.paths.assets + 'img/'));
});
gulp.task('assets', () => {
	return gulp.parallel(
		'initialize',
		'img'
	)
});

gulp.task('browser-sync', (done) => {
    browserSync({
        notify: false,
        ghostMode: false,
        open: 'external',
        server: {
            middleware: [
                connectSSI({
                    baseDir: "dist",
                    ext: '.html',
                }),
            ],
        }
	});
	done();
})
gulp.task('bs-reload', () => {
    browserSync.reload();
});

gulp.task('watch', () => {
	gulp.watch('./src/pug/**/*.pug', gulp.parallel('pug', 'bs-reload'))
	gulp.watch('./src/scss/**/*.scss', gulp.series('sass'))
	gulp.watch('./src/js/**/*.js', gulp.series('webpack', 'bs-reload'))
	gulp.watch('./src/img/**/*.{png,jpg,gif,svg}', gulp.series('assets'))
});

gulp.task('default', gulp.series('browser-sync', gulp.parallel('pug', 'sass', 'webpack', 'assets', 'watch')));