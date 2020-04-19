const { series, task, src, dest, watch } = require('gulp');

const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const pug = require('gulp-pug');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const tsify = require('tsify');
const sourcemaps = require('gulp-sourcemaps');
const buffer = require('vinyl-buffer');
const browserSync = require('browser-sync');

// Views
const views = () => {
  return src(['src/pages/*.pug'])
    .pipe(pug({
      pretty: true,
    }))
    .pipe(dest('dist'));
}

// Styles
sass.compiler = require('node-sass');
const sassParams = {
  sourceMap: true,
  includePaths: require('node-normalize-scss').includePaths
}

const sassTask = () => {
  return src('src/sass/styles.sass')
    .pipe(sourcemaps.init())
    .pipe(sass(sassParams).on('error', (err) => { sass.logError(err), this.emit('end'); }))
    .pipe(sourcemaps.write('./'))
    .pipe(dest('dist/assets/css'));
};

const cssPrefixer = () => {
  return src('dist/assets/css/styles.css')
    .pipe(autoprefixer({
      cascade: false,
    }))
    .pipe(dest('dist/assets/css'));
}

// JavaScript
const bundleTS = () => {
  return browserify({
    basedir: '.',
    debug: true,
    entries: ['src/typescript/index.ts'],
    cache: {},
    packageCache: {}
  })
    .plugin(tsify)
    .transform('babelify', {
      presets: ['es2015'],
      extensions: ['.ts']
    })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(dest('dist/assets/js'));
}

// Browser Sync
const bserve = () => {
  browserSync.init({
    server: {
      baseDir: 'dist',
      index: 'index.html'
    }
  });
  watch('src/sass/**/*', series(sassTask, cssPrefixer));
  watch('src/pages/**/*', series(views));
  watch('src/typescript/**/*', series(bundleTS));
  watch('dist/**/*.*').on('change', browserSync.reload);
}

task('build', series(views, sassTask, cssPrefixer, bundleTS))

task('serve', series('build', bserve));

task('default', series('build'));