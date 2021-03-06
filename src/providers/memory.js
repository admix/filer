define(function(require) {
  var FILE_SYSTEM_NAME = require('src/constants').FILE_SYSTEM_NAME;

  // Based on https://github.com/caolan/async/blob/master/lib/async.js
  var nextTick = (function() {
    if (typeof process === 'undefined' || !(process.nextTick)) {
      if (typeof setImmediate === 'function') {
        return function (fn) {
          // not a direct alias for IE10 compatibility
          setImmediate(fn);
        };
      } else {
        return function (fn) {
          setTimeout(fn, 0);
        };
      }
    }
    return process.nextTick;
  }());

  function asyncCallback(callback) {
    nextTick(callback);
  }

  function MemoryContext(db, readOnly) {
    this.readOnly = readOnly;
    this.objectStore = db;
  }
  MemoryContext.prototype.clear = function(callback) {
    if(this.readOnly) {
      asyncCallback(function() {
        callback("[MemoryContext] Error: write operation on read only context");
      });
      return;
    }
    var objectStore = this.objectStore;
    Object.keys(objectStore).forEach(function(key){
      delete objectStore[key];
    });
    asyncCallback(callback);
  };
  MemoryContext.prototype.get = function(key, callback) {
    var that = this;
    asyncCallback(function() {
      callback(null, that.objectStore[key]);
    });
  };
  MemoryContext.prototype.put = function(key, value, callback) {
    if(this.readOnly) {
      asyncCallback(function() {
        callback("[MemoryContext] Error: write operation on read only context");
      });
      return;
    }
    this.objectStore[key] = value;
    asyncCallback(callback);
  };
  MemoryContext.prototype.delete = function(key, callback) {
    if(this.readOnly) {
      asyncCallback(function() {
        callback("[MemoryContext] Error: write operation on read only context");
      });
      return;
    }
    delete this.objectStore[key];
    asyncCallback(callback);
  };


  function Memory(name) {
    this.name = name || FILE_SYSTEM_NAME;
    this.db = {};
  }
  Memory.isSupported = function() {
    return true;
  };

  Memory.prototype.open = function(callback) {
    asyncCallback(function() {
      callback(null, true);
    });
  };
  Memory.prototype.getReadOnlyContext = function() {
    return new MemoryContext(this.db, true);
  };
  Memory.prototype.getReadWriteContext = function() {
    return new MemoryContext(this.db, false);
  };

  return Memory;
});
