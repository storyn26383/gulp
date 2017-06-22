const gulp = require('gulp');
const sass = require('gulp-sass');
const pug = require('gulp-pug');
const gutil = require('gulp-util');
const babel = require('gulp-babel');
const clean = require('gulp-clean');
const concat = require('gulp-concat');
const notify = require('gulp-notify');
const uglify = require('gulp-uglify');
const cleanCss = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const pugInheritance = require('@unisharp/gulp-pug-inheritance');

gulp.task('pug', () =>
  gulp.src('./src/pug/**/*.pug')
      .pipe(pug(gutil.env.production ? {} : { pretty: true }))
      .on('error', notify.onError('Error: <%= error.message %>'))
      .pipe(gulp.dest('./public'))
      .pipe(notify('File: ./public/<%= file.relative %> Compiled!'))
);

gulp.task('sass', () =>
  gulp.src('./src/sass/app.scss')
      .pipe(sourcemaps.init())
      .pipe(sass(gutil.env.production ? { outputStyle: 'compressed' } : {}))
      .on('error', notify.onError('Error: <%= error.message %>'))
      .pipe(autoprefixer({ browsers: ['last 2 versions'] }))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('./temp/css'))
      .pipe(notify('File: ./temp/css/<%= file.relative %> Compiled!'))
);

gulp.task('css', ['sass'], () =>
  gulp.src([
        './temp/css/app.css'
      ])
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(concat('app.css'))
      .pipe(gutil.env.production ? cleanCss() : gutil.noop())
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('./public/css'))
      .pipe(notify('File: ./public/css/<%= file.relative %> Compiled!'))
      .pipe(browserSync.stream({ match: '**/*.css' }))
);

gulp.task('babel', () =>
  gulp.src('./src/babel/app.js')
      .pipe(sourcemaps.init())
      .pipe(babel({ presets: ['es2015'] }))
      .on('error', notify.onError('Error: <%= error.message %>'))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('./temp/js'))
      .pipe(notify('File: ./temp/js/<%= file.relative %> Compiled!'))
);

gulp.task('js', ['babel'], () =>
  gulp.src([
        './bower_components/jquery/dist/jquery.js',
        './bower_components/tether/dist/js/tether.js',
        './bower_components/bootstrap/dist/js/bootstrap.js',
        './temp/js/app.js'
      ])
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(concat('app.js'))
      .pipe(gutil.env.production ? uglify() : gutil.noop())
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('./public/js'))
      .pipe(notify('File: ./public/js/<%= file.relative %> Compiled!'))
      .pipe(browserSync.reload({ stream: true }))
);

gulp.task('copy:images', () =>
  gulp.src('./src/images/**/*')
      .pipe(gulp.dest('./public/images'))
      .pipe(notify('File: ./public/images/<%= file.relative %> Copied!'))
);

gulp.task('copy:fonts', () =>
  gulp.src('./bower_components/font-awesome-sass/assets/fonts/**/*')
      .pipe(gulp.dest('./public/fonts'))
      .pipe(notify('File: ./public/fonts/<%= file.relative %> Copied!'))
);

gulp.task('copy', ['copy:fonts', 'copy:images']);

gulp.task('clean:temp', ['css', 'js'], () =>
  gulp.src('./temp')
      .pipe(clean())
);

gulp.task('clean:dist', () =>
  gulp.src('./public')
      .pipe(clean())
);

gulp.task('clean', ['clean:temp', 'clean:dist']);

gulp.task('watch', () => {
  browserSync.init({
    host: '0.0.0.0',
    server: './public',
    open: false
  });

  gulp.watch('./src/pug/**/*.pug', e =>
    gulp.src(e.path, { base: './src/pug' })
        .pipe(pugInheritance('./src/pug/**/*.pug'))
        .pipe(pug({ pretty: true }))
        .on('error', notify.onError('Error: <%= error.message %>'))
        .pipe(gulp.dest('./public'))
        .pipe(notify('File: ./<%= file.relative %> Compiled!'))
        .pipe(browserSync.reload({ stream: true }))
  );
  gulp.watch('./src/sass/**/*.scss', ['css']);
  gulp.watch('./src/babel/**/*.js', ['js']);
  gulp.watch('./src/images/**/*', ['copy:images']);
});

gulp.task('default', ['pug', 'css', 'js', 'copy', 'clean:temp']);
