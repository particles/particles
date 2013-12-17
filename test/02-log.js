var expect = require('chai').expect,
  _ = require('lodash'),
  testStream = require('./02-log/testStream.js'),
  Config = require('../lib/config'),
  LoggerFactory = require('../lib/logger');

var FIXTURES = __dirname + "/02-log/";


var BASE_CONF = {
  appRoot: __dirname,
  logger: {
    root: {
      level: "info",
      streams: [
        {
          level: "error",
          stream: "${appRoot}/02-log/testStream",
          type: "raw"
        }
      ]
    }
  }
};

describe('Logger',function() {
  describe('root levels', function() {
    var logger;
    beforeEach(function() {
      var config = new Config();
      config.initialize(BASE_CONF);
      logger = new LoggerFactory(config);
    });

    it('should stream messages when level > logger > stream level', function(done) {
      testStream.callback = function(data) {
        expect(data.msg).to.be.equal("Hello");
        expect(data.level).to.be.equal(50);
        done();
      };
      logger.create().error("Hello");
    });


    it('should not stream messages when level < logger > stream level', function(done) {
      testStream.callback = function(data) {
        done(new Error("Should not output messages"));
      };
      logger.create().info("Hello");
      setTimeout(done, 200);
    });

    it('should not stream messages when level > logger < stream level', function(done) {
      testStream.callback = function(data) {
        done(new Error("Should not output messages"));
      };
      logger.create().warn("Hello");
      setTimeout(done, 200);
    });
  });


  describe('child loggers', function() {
    var logger;
    beforeEach(function() {
      var c = _.cloneDeep(BASE_CONF);
      c.logger.test = {
        level: "debug"
      };
      var config = new Config();
      config.initialize(c);
      logger = new LoggerFactory(config);
    });

    it('should stream messages when level > root logger > child level', function(done) {
      testStream.callback = function(data) {
        expect(data.msg).to.be.equal("Hello");
        expect(data.component).to.be.equal("test");
        expect(data.level).to.be.equal(50);
        done();
      };
      logger.create("test").error("Hello");
    });


    it('should stream messages when level < root logger > child level', function(done) {
      testStream.callback = function(data) {
        expect(data.msg).to.be.equal("Hello");
        expect(data.level).to.be.equal(20);
        done();
      };
      logger.create("test").debug("Hello");
    });
  });
});
