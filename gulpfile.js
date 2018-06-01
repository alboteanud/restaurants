
const gulp = require('gulp');
const del = require('del');
const runSequence = require('run-sequence');
const workboxBuild = require('workbox-build');

gulp.task('clean', () => del(['.tmp', 'build/*', '!build/.git'], {dot: true}));

// this task copies "app" files into "build"
gulp.task('copy', () =>
gulp.src([
  'app/**/*',
]).pipe(gulp.dest('build'))
);

gulp.task('default', ['clean'], cb => {
  runSequence(
    'copy',
    'service-worker',
    cb
  );
});

gulp.task('watch', function() {
  gulp.watch('app/**/*', ['default']);
});

gulp.task('service-worker', () => {
  return workboxBuild.injectManifest({
    swSrc: 'app/sw.js',
    swDest: 'build/sw.js',
    globDirectory: 'build',
    globPatterns: [
      '**\/*.{html,json,js,css}',
      'img/*.*',
    ]
  }).catch(err => {
    console.log('[ERROR]: ' + err);
  });
});

