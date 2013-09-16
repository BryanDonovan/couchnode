var assert = require('assert');
var H = require('../test_harness.js');

// Generates a new client for each test as the tests
//  meddle with the state of the connection.

describe('#shutdown', function() {

  it('should work', function(done) {
    var cb = H.newClient();
    var key = H.genKey("shutdown-1");

    H.setGet(key, "foo", function() {
      cb.shutdown();
      done();
    });
  });

  it('should not fail when calling shutdown multiple times', function(done) {
    var cb = H.newClient();

    cb.set("key", "value", H.okCallback(function() {
      cb.shutdown();
      cb.get("key", function() {});
      cb.shutdown();
      done();
    }));
  });

  it('should fail operations after shutdown', function(done) {
    var cb = H.newClient();

    cb.set("key", "value", function() {
      cb.shutdown();
      setTimeout(function() {
        cb.get("key", function(err) {
          assert(err, "Operation fails after shutdown");
          done();
        });
      }, 10);
    });
  });

});
