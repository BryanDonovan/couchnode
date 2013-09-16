#!/usr/bin/env node
process.env.NODE_ENV = 'test';
require('../lib/couchbase');

var Mocha = require('mocha');
var optimist = require('optimist');
var walk_dir = require('./support/walk_dir');

var argv = optimist
  .usage("Usage: $0 --reporter [reporter] --timeout [timeout]")
  .default({reporter: 'spec', timeout: 6000})
  .describe('reporter', 'The mocha test reporter to use.')
  .describe('timeout', 'The mocha timeout to use per test (ms).')
  .boolean('help')
  .alias('timeout', 't')
  .alias('reporter', 'R')
  .alias('help', 'h')
  .argv;

var mocha = new Mocha({timeout: argv.timeout, reporter: argv.reporter, ui: 'bdd'});

var is_valid_file = function (file) {
  if (file.match(/\/support/)) {
    return false;
  }

  var ext = ".js";

  if (file.indexOf(ext) !== -1) {
    return true;
  }

  return false;
};

function run(cb) {
  walk_dir.walk('test', is_valid_file, function (err, files) {
    if (err) { return cb(err); }

    files.forEach(function (file) {
      mocha.addFile(file);
    });

    cb();
  });
}

run(function (err) {
  if (err) { throw err; }
  mocha.run(function (failures) {
    process.exit(failures);
  });
});
