module.exports = function(grunt) {
    var istanbulJpm = require("istanbul-jpm");
    // gross, put this in the process
    process.env.coveragedir = require("os").tmpdir();
    console.log(process.env.coveragedir);
    grunt.initConfig({
        eslint: {
            files: '{lib,data,test}/**/*.js{,on}',
            options: {
                quiet: true
            }
        },
        shell: {
            addonLintTest: {
                command: 'jpm xpi; addons-linter --output json --pretty *xpi | node addon-lint-consumer.js',
            },
            makeCoverageTest: {
                command: "echo > test/z-ensure-coverage.js; git ls-tree -r HEAD --name-only lib | grep \"js$\" | xargs -I '{}' echo 'require(\"../{}\");' | egrep -v \"(jetpack|main.js)\" >> test/z-ensure-coverage.js",
            },
            makeTestEnv: {
                command: 'rm -rf testing-env && mkdir testing-env && cd testing-env && cat ../.jpmignore ../.jpmignore-testing-env > .jpmignore && ln -s ../Gruntfile.js . && ln -s ../node_modules . && ln -s ../data . && ln -s ../coverage/instrument/lib . && ln -s ../package.json . && ln -s ../test .',
            },
            jpmTest: {
                command: 'cd testing-env && jpm test',
            },
            jpmTestTravis: {
                command: 'cd testing-env && jpm test -b /usr/local/bin/firefox',
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

    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-istanbul');

    grunt.registerTask('readcoverageglobal', 'Reads the coverage global JPM wrote', function() {
        global.__coverage__ = require("istanbul-jpm/global-node").global.__coverage__;
        grunt.log.ok("Read __coverage__ global");
    });

    if (process.env.TRAVIS) {
        grunt.log.ok("testing with travis path for fx");
        grunt.registerTask('test', ['eslint', 'shell:addonLintTest', 'instrument', 'shell:makeCoverageTest', 'shell:makeTestEnv', 'shell:jpmTestTravis', 'readcoverageglobal', 'storeCoverage', 'makeReport']);
    } else {
        grunt.registerTask('test', ['eslint', 'shell:addonLintTest', 'instrument', 'shell:makeCoverageTest', 'shell:makeTestEnv', 'shell:jpmTest', 'readcoverageglobal', 'storeCoverage', 'makeReport']);
    }
};
