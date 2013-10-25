var utils = require('particles-prereq'),
  path  = require('path'),
  Scatter = require('scatter');


var running = false;

var self = module.exports = {

  run: function(appRoot, options) {
    if(running) {
      return utils.promises.resolve();
    }
    running = true;

    options = options || {};

    //initialize
    utils.initialize({
      appRoot: appRoot,
      configDir: options.configDir
    });

    var defaultLogger = utils.logger();
    var scatterLogger = utils.logger("Scatter");

    var scatter = new Scatter({
      log: function() {
        return scatterLogger.log.apply(scatterLogger, arguments);
      },
      startProfiling: function(name) {
        return scatterLogger.startProfiling(name);
      }
    });

    var configNamespace = options.configNamespace || 'particles.app';
    scatter.registerParticles(utils.config.get(configNamespace + '.particles'));

    var nodeModulesDir = utils.config.get(configNamespace + '.nodeModulesDir') || (path.join(appRoot, 'node_modules'));
    scatter.setNodeModulesDir(nodeModulesDir);

    var runServices = options.runServices || ['svc|sequence!app_start'];
    var promise = utils.promises.resolve();
    runServices.forEach(function(svcName) {
      promise = promise.then(function() {
        return scatter.load(svcName).then(function(svc) {
          return svc.apply(null, options.serviceArgs || []);
        });
      });
    });

    return promise.then(function() {
      defaultLogger.info("Particles app started!");
      running = false;
    }).otherwise(function(err) {
      defaultLogger.error(err.stack);
      running = false;
      throw err;
    });
  }
};