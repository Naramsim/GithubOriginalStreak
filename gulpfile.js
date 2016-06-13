const gulp = require('gulp')
const combiner = require('stream-combiner2')
const newer = require('gulp-newer')
const babel = require('gulp-babel')
const chrome = './chrome/src/inject/'
const ff = './firefox/data/'
const src = './src/*'

gulp.task('syncCSS', function() {
    let combined = combiner.obj([
        gulp.src(src + '.css'),
        newer(ff),
        newer(chrome),
        gulp.dest(ff),
        gulp.dest(chrome)
    ])
    combined.on('error', console.error.bind(console))
    return combined
})

gulp.task('syncJS', function() {
    let combined = combiner.obj([
        gulp.src(src+ '.js'),
        newer(ff),
        newer(chrome),
        babel({
            presets: ['es2015']
        }),
        gulp.dest(ff),
        gulp.dest(chrome)
    ])
    combined.on('error', console.error.bind(console))
    return combined
})

gulp.task('watch', function() {
    gulp.watch(src, ['syncCSS', 'syncJS'])
})