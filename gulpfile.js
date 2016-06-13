const gulp = require('gulp')
const combiner = require('stream-combiner2');
const newer = require('gulp-newer')
const babel = require('gulp-babel')
const cssnano = require('gulp-cssnano')
const uglify = require('gulp-uglify')
const chrome = './chrome/src/inject/'
const ff = './firefox/data/'
const src = './src/*'

gulp.task('syncCSS', function() {
	var combined = combiner.obj([
			gulp.src(src + '.css'),
			newer(ff),
			newer(chrome),
			//cssnano(),
			gulp.dest(ff),
			gulp.dest(chrome)
		])
	combined.on('error', console.error.bind(console))
	return combined
});

gulp.task('syncJS', function() {
	var combined = combiner.obj([
			gulp.src(src+ '.js'),
			newer(ff),
			newer(chrome),
			babel({
				presets: ['es2015']
			}),
			//uglify(),
			gulp.dest(ff),
			gulp.dest(chrome)
		])
	combined.on('error', console.error.bind(console))
	return combined
});

gulp.task('watch', function() {
	gulp.watch(src, ['syncCSS', 'syncJS'])
})