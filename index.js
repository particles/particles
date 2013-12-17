var utils = require('particles-prereq'),
  path  = require('path'),
  Scatter = require('scatter');


var self = module.exports = {
  config: utils.config,
  scatter: null,
  run: function(options) {
    options = options || {};

    //initialize
    utils.initialize(options.config);

    var defaultLogger = utils.logger();
    var scatterLogger = utils.logger("scatter");

    self.scatter = new Scatter({
      log: function() {
        return scatterLogger.log.apply(scatterLogger, arguments);
      },
      startProfiling: function(name) {
        return scatterLogger.startProfiling(name);
      }
    });

    var containerName = utils.config.get('container') || 'default';
    self.scatter.registerParticles(utils.config.get(['containers', containerName, 'particles']));

    //register prereq now
    self.scatter.registerParticles(__dirname + "/node_modules/particles-prereq");

    var nodeModulesDir = utils.config.get(['containers', containerName, 'nodeModulesDir']) || 
      (path.join(utils.config.get('appRoot'), 'node_modules'));
    self.scatter.setNodeModulesDir(nodeModulesDir);

    var promise = utils.promises.when(options.beforeServices && options.beforeServices(self));
    
    var runServices = options.runServices || ['svc|sequence!app_start'];
    runServices.forEach(function(svcName) {
      promise = promise.then(function() {
        return self.scatter.load(svcName).then(function(svc) {
          return svc.apply(null, options.serviceArgs || []);
        });
      });
    });

    return promise.then(function() {
      defaultLogger.info("Particles app started!");
      return self.scatter;
    }).otherwise(function(err) {
      defaultLogger.error({err: err}, "Failed to run Particles app");
      throw err;
    });
  }
};