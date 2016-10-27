module.exports = function (grunt) {
  // gross, put this in the process
  process.env.coveragedir = require('os').tmpdir();
  console.log('coveragedir: %s', process.env.coveragedir);

  grunt.initConfig({
    storeCoverage: {
      options: {
        dir: 'coverage/reports'
      }
    },
    makeReport: {
      src: 'coverage/reports/**/*.json',
      options: {
        type: 'lcov',
        dir: 'coverage/reports',
        print: 'detail'
      }
    }
  });

  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-istanbul');

  grunt.registerTask('readcoverageglobal', 'Reads the coverage global JPM wrote', function () {
    global.__coverage__ = require('istanbul-jpm/global-node').global.__coverage__;
    grunt.log.ok('Read __coverage__ global');
  });

  grunt.registerTask('reportLocation', function () {
    grunt.log.writeln('report at:', 'coverage/reports/lcov-report/index.html'['blue']);
  });

  grunt.registerTask('coverageReport', [
    'readcoverageglobal',
    'storeCoverage',
    'makeReport',
    'reportLocation'
  ]);

  grunt.registerTask('test', [
    'coverageReport'
  ]);
};
