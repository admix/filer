define(["Filer", "tests/lib/indexeddb", "tests/lib/websql", "tests/lib/memory"],
function(Filer, IndexedDBTestProvider, WebSQLTestProvider, MemoryTestProvider) {

  var _provider;
  var _fs;

  function uniqueName() {
    if(!uniqueName.seed) {
      uniqueName.seed = Date.now();
    }
    return 'filer-testdb-' + uniqueName.seed++;
  }

  function setup(callback) {
    // We support specifying the provider via the query string
    // (e.g., ?filer-provider=IndexedDB). If not specified, we use
    // the Memory provider by default.  See test/require-config.js
    // for definition of window.filerArgs.
    var providerType = window.filerArgs && window.filerArgs.provider ?
      window.filerArgs.provider : 'Memory';

    var name = uniqueName();

    switch(providerType.toLowerCase()) {
      case 'indexeddb':
        _provider = new IndexedDBTestProvider(name);
        break;
      case 'websql':
        _provider = new WebSQLTestProvider(name);
        break;
      case 'memory':
      /* falls through */
      default:
        _provider = new MemoryTestProvider(name);
        break;
    }

    // Allow passing FS flags on query string
    var flags = window.filerArgs && window.filerArgs.flags ?
      window.filerArgs.flags : 'FORMAT';

    // Create a file system and wait for it to get setup
    _provider.init();

    function complete(err, fs) {
      if(err) throw err;
      _fs = fs;
      callback();
    }
    return new Filer.FileSystem({
      name: name,
      provider: _provider.provider,
      flags: flags
    }, complete);
  }

  function fs() {
    if(!_fs) {
      throw "TestUtil: call setup() before fs()";
    }
    return _fs;
  }

  function provider() {
    if(!_provider) {
      throw "TestUtil: call setup() before provider()";
    }
    return _provider;
  }

  function cleanup(callback) {
    if(!_provider) {
      return;
    }
    _provider.cleanup(function() {
      _provider = null;
      _fs = null;
      callback();
    });
  }

  return {
    uniqueName: uniqueName,
    setup: setup,
    fs: fs,
    provider: provider,
    providers: {
      IndexedDB: IndexedDBTestProvider,
      WebSQL: WebSQLTestProvider,
      Memory: MemoryTestProvider
    },
    cleanup: cleanup
  };

});
