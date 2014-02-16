var Config = require('./lib/config'),
  LoggerFactory = require('./lib/logger'),
  path  = require('path'),
  promises = require('./lib/promises'),
  Scatter = require('scatter'),
  ScatterPluginConfig = require('scatter-plugin-config'),
  ScatterPluginAll = require('scatter-plugin-all');

function ParticlesApp(options) {
  this.options = options || {};
  this.config = new Config();
  this.config.initialize(this.options.config);
  
  this.loggerFactory = new LoggerFactory(this.config);

  this.defaultLogger = this.loggerFactory.create();
  this.scatterLogger = this.loggerFactory.create("scatter");
  
  var self = this;
  this.scatter = new Scatter({
    log: self.scatterLogger.log.bind(this.scatterLogger),
    startProfiling: self.scatterLogger.startProfiling.bind(this.scatterLogger),
    plugins: [new ScatterPluginConfig(), new ScatterPluginAll()]
  });

  //register core modules
  this.scatter.registerModuleInstance('config', this.config);
  this.scatter.registerModuleInstance('logger', this.loggerFactory.create.bind(this.loggerFactory));
  this.scatter.registerModuleInstance('log', this.defaultLogger);
  this.scatter.registerModuleInstance('utils/promises', promises);
  
  var containerName = this.options.container || this.config.get('container') || 'default';
  this.scatter.registerParticles(this.config.get(['containers', containerName, 'particles']));
  
  var nodeModulesDir = this.config.get(containerName + '.nodeModulesDir') || 
      (path.join(this.config.get('appRoot'), 'node_modules'));
  this.scatter.setNodeModulesDir(nodeModulesDir);
}

ParticlesApp.prototype.load = function() {
  return this.scatter.load.apply(this.scatter, arguments);
};

ParticlesApp.prototype.run = function(service /*, ..args*/) {
  var self = this;
  service = service || 'svc!app_start';
  var args = Array.prototype.slice.call(arguments, 1);
  self.defaultLogger.info("About to run Particles service ["+service+"]");
  return self.scatter.load(service).then(function(svc) {
    return svc.apply(null, args);
  })
  .then(function(res) {
    self.defaultLogger.info("Particles service ["+service+"] successfully invoked");
    return res;
  })
  .otherwise(function(err) {
    self.defaultLogger.error({err: err}, "Failed to run Particles service");
    throw err;
  });
};


module.exports = ParticlesApp;

