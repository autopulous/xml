'use strict';

module.exports = function (config) {
    config.set({
        basePath: '../',

        files: ['bower_components/jasmine.async/lib/jasmine.async.js', 'xml.js', 'xml.load.js', 'test/**/unit.js', {pattern: 'test/resources/*', included: false}],

        autoWatch: true,

        frameworks: ['jasmine'],

        browsers: ['Chrome'],

        plugins: ['karma-jasmine', 'karma-chrome-launcher', 'karma-spec-reporter'],

        reporters: ["spec"],

        specReporter: {
            maxLogLines: 50,
            suppressFailed: false,
            suppressPassed: false,
            suppressSkipped: false,
            suppressErrorSummary: true
        }
    });
};
