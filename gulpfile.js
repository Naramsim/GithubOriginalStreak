var gulp = require('gulp');
var newer = require('gulp-newer');
var chrome = './chrome/src/inject/*'
var ff = './firefox/data/'

gulp.task('sync', function() {
	return gulp.src(chrome)
		.pipe(newer(ff))
		.pipe(gulp.dest(ff));
});

gulp.task('watch', function() {
	gulp.watch(chrome, ['sync']);
})