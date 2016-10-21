module.exports = function (grunt) {
  var istanbulJpm = require('istanbul-jpm');

  // gross, put this in the process
  process.env.coveragedir = require('os').tmpdir();
  console.log('coveragedir: %s', process.env.coveragedir);

  var fxBinary = process.env.JPM_FIREFOX_BINARY || 'Aurora';

  grunt.initConfig({
    eslint: {
      files: '**/*.js',
      options: {
        quiet: true
      }
    },
    shell: {
      addonLintTest: {
        command: 'scripts/addonLintTest ' + require('./package.json').name
      },
      cleanCoverage: {
        command: 'rm -rf coverage'
      },
      'ensure-files-are-covered': {
        command: 'scripts/ensure-files-are-covered'
      },
      makeTestEnv: {
        command: 'scripts/makeTestEnv'
      },
      jpmTest: {
        command: 'cd testing-env && node_modules/.bin/jpm test --tbpl -b ' + fxBinary
      }
    },
    instrument: {
      files: 'lib/**/*.js',
      options: {
        lazy: false,
        basePath: 'coverage/instrument',
        instrumenter: istanbulJpm.Instrumenter
      }
    },
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

  grunt.registerTask('jpmtest', [
    'shell:ensure-files-are-covered',
    'shell:makeTestEnv',
    'shell:jpmTest',
  ]);

  grunt.registerTask('test', [
    'shell:addonLintTest',
    'shell:cleanCoverage',
    'instrument',
    'jpmtest',
    'coverageReport'
  ]);
};
