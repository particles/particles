
var expect = require('chai').expect,
  fs = require('fs'),
  rimraf = require('rimraf'),
  Config = require('../lib/config'),
  Scatter = require('scatter');


var ROOT_DIRS = [
  __dirname + '/../lib'
];

var FIXTURES = __dirname + "/01-config/";

describe('Config',function() {
  describe('[used from require()]', function() {
    var config;
    beforeEach(function() {
      config = new Config();
    });

    it('should NOT be empty if initialized', function() {
      config.initialize();
      expect(config.get()).not.to.be.empty;
    });

    it('check clearing', function() {
      config.initialize();
      config.clear();
      expect(config.get()).to.be.empty;
    });

    it('should contain env variables', function() {
      config.initialize();
      expect(config.get('HOME')).to.be.equal(process.env.HOME);
    });

    it('should load defaults.json contents', function() {
      config.initialize({appRoot: __dirname, configDir: FIXTURES+'/basic'});

      expect(config.get('flat')).to.be.equal("helloFlat!");
      expect(config.get('level.val')).to.be.equal("helloLevel!");
      expect(config.get('appRoot')).to.be.equal(__dirname);
    });

    it('should load default.json contents, from default named config dir', function() {
      config.initialize({appRoot: FIXTURES});

      expect(config.get('flat')).to.be.equal("helloFlat!");
      expect(config.get('level.val')).to.be.equal("helloLevel!");
      expect(config.get('appRoot')).to.be.equal(FIXTURES);
    });

    describe('templates', function() {
      beforeEach(function() {
        config.initialize({appRoot: __dirname, configDir: FIXTURES+'/templates'});
      });

      it('should replace vars', function() {
        expect(config.get('hello')).to.be.equal("hello");
        expect(config.get('helloWorld')).to.be.equal("hello world!");
        expect(config.get('helloWorldExt')).to.be.equal("hello world!!!");
      });

      it('should handle undefined values', function() {
        expect(config.get('helloWrong')).to.not.exist;
      });

      it('should handle options in variables using "|" ', function() {
        expect(config.get('option')).to.be.equal('hey');
      });

      it('should handle options in replacer variables', function() {
        expect(config.get('option2')).to.be.equal('hey');
      });

      it('should handle undefined variables in replacer variables', function() {
        expect(config.get('option3')).to.be.equal('');
      });

      it('should throw if variable not found ', function() {
        expect(function() {
          config.get('helloThrow');
        }).to.throw(/it is undefined/);
      });

    });
    
    it('should load chained configs', function() {
      config.initialize({appRoot: __dirname, configDir: FIXTURES+'/chaining'});

      expect(config.get('other')).to.be.equal("2");
      expect(config.get('hello')).to.be.equal("hello1");
      expect(config.get('overridden')).to.be.true;
      expect(config.get('world.name')).to.be.equal("world1");
      expect(config.get('world.name2')).to.be.equal("world2");
    });

    it('should persist config values (to empty file)', function(done) {
      var overrideFile = FIXTURES+'/persist/overrides.gen.json';
      rimraf.sync(overrideFile);

      config.initialize({appRoot: __dirname, configDir: FIXTURES+'/persist'});

      config.persistOverride('anotherkey', 'anotherval', function(err) {
        if(err) return done(err);

        expect(config.get('anotherkey')).to.be.equal('anotherval');
        expect(fs.existsSync(overrideFile)).to.be.true;
        expect(JSON.parse(fs.readFileSync(overrideFile)))
          .to.have.property('anotherkey', 'anotherval');
        done();
      });
    });

    it('should persist config values (to existing file)', function(done) {
      var overrideFile = FIXTURES+'/persist/overrides.gen.json';
      config.initialize({appRoot: __dirname, configDir: FIXTURES+'/persist'});

      config.persistOverride('anotherkey2', 'anotherval2', function(err) {
        if(err) return done(err);

        expect(config.get('anotherkey')).to.be.equal('anotherval');
        expect(config.get('anotherkey2')).to.be.equal('anotherval2');
        expect(fs.existsSync(overrideFile)).to.be.true;
        expect(JSON.parse(fs.readFileSync(overrideFile)))
          .to.have.property('anotherkey', 'anotherval');
        expect(JSON.parse(fs.readFileSync(overrideFile)))
          .to.have.property('anotherkey2', 'anotherval2');
        done();
      });
    });

    it('should handle comments in json files', function() {
      config.initialize({appRoot: __dirname, configDir: FIXTURES+'/comments'});

      expect(config.get('level.val')).to.be.equal('helloLevel!');
    });
  });
});
