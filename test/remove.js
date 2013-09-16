var assert = require('assert');
var H = require('../test_harness.js');
var couchbase = require('../lib/couchbase.js');

var cb = H.newClient();

describe('#remove', function() {

  it('should work with basic inputs', function(done) {
    var key = H.genKey();

    cb.set(key, "a value", H.okCallback(function() {
      cb.get(key, H.okCallback(function() {
        cb.remove(key, H.okCallback(function() {
          cb.get(key, function(err) {
            assert.equal(err.code, couchbase.errors.keyNotFound);
            done();
          });
        }));
      }));
    }));
  });

  it('should work with cas values', function(done) {
    var key = H.genKey();
    var value = "Value";

    cb.set(key, value, H.okCallback(function(meta1) {
      cb.set(key, "new value", H.okCallback(function(meta2) {
        cb.remove(key, {cas: meta1.cas}, function(err) {
          assert.equal(err.code, couchbase.errors.keyAlreadyExists, "Remove fails with bad CAS");
          cb.remove(key, {cas: meta2.cas}, H.okCallback(function() {
            done();
          }));
        });
      }));
    }));
  });

  it('should fail for non-existent keys', function(done) {
    var key = H.genKey();
    var value = "some value";

    cb.set(key, value, H.okCallback(function() {
      cb.remove(key, H.okCallback(function() {
        cb.remove(key, function(err) {
          assert.equal(err.code, couchbase.errors.keyNotFound);
          done();
        });
      }));
    }));
  });

  it('should work with multiple values', function(done) {
    var kv = H.genMultiKeys(10, "removeMulti");

    cb.setMulti(kv, {spooled: true}, H.okCallback(function() {
      cb.getMulti(Object.keys(kv), {spooled: true}, H.okCallback(function(results) {
        cb.removeMulti(results, {spooled: true}, H.okCallback(function() {
          done();
        }));
      }));
    }));
  });

});
