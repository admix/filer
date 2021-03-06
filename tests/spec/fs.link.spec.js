define(["Filer", "util"], function(Filer, util) {

  describe('fs.link', function() {
    beforeEach(util.setup);
    afterEach(util.cleanup);

    it('should be a function', function() {
      var fs = util.fs();
      expect(fs.link).to.be.a('function');
    });

    it('should create a link to an existing file', function(done) {
      var fs = util.fs();

      fs.open('/myfile', 'w+', function(error, fd) {
        if(error) throw error;

        fs.close(fd, function(error) {
          if(error) throw error;

          fs.link('/myfile', '/myotherfile', function(error) {
            if(error) throw error;

            fs.stat('/myfile', function(error, result) {
              if(error) throw error;

              var _oldstats = result;
              fs.stat('/myotherfile', function(error, result) {
                expect(error).not.to.exist;
                expect(result.nlinks).to.equal(2);
                expect(result).to.deep.equal(_oldstats);
                done();
              });
            });
          });
        });
      });
    });

    it('should not follow symbolic links', function(done) {
      var fs = util.fs();

      fs.stat('/', function (error, result) {
        if (error) throw error;
        var _oldstats = result;
        fs.symlink('/', '/myfileLink', function (error) {
          if (error) throw error;
          fs.link('/myfileLink', '/myotherfile', function (error) {
            if (error) throw error;
            fs.lstat('/myfileLink', function (error, result) {
              if (error) throw error;
              var _linkstats = result;
              fs.lstat('/myotherfile', function (error, result) {
                expect(error).not.to.exist;
                expect(result).to.deep.equal(_linkstats);
                expect(result.nlinks).to.equal(2);
                done();
              });
            });
          });
        });
      });
    });
  });

});