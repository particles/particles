var path = require('path'),
  fs = require('fs'),
  jm = require("./json-minify"),
  objectPath = require('object-path'),
  extend = require('extend'),
  _ = require('lodash');


function Config() {
  this.data = {};
}


Config.prototype._processTemplate = function(tpl) {
  var self = this;
  if(_.isString(tpl)) {
    return tpl.replace(/^={([\w\.\|]+)}$/, replacer(true)).replace(/\${([\w\.\|]+)}/g, replacer(false));

    function replacer(nothrow) {
      return function(match, varname) {
        var vars = varname.split("|");
        for(var i = 0; i < vars.length; i++) {
          var val = self.get(vars[i]);
          if(val) {
            return val;
          }
        }
        
        if(nothrow) {
          return "";
        }
        
        throw new Error("Cannot replace config variable '" + varname +"' in '"+ tpl +"' because it is undefined");
      }
    }
  } else if(_.isArray(tpl)) {
    var arr = [];
    _.each(tpl, function(val) {
      arr.push(self._processTemplate(val));
    });
    return arr;
  } else if(_.isObject(tpl)){
    var obj = {};
    _.each(tpl, function(val, key) {
      obj[key] = self._processTemplate(val);
    });
    return obj;
  }
  return tpl;
};


Config.prototype.get = function(key) {
  return this._processTemplate(this.getRaw(key));
};

Config.prototype.getRaw = function(key) {
  return objectPath.get(this.data, key);
};

Config.prototype.set = function(key, val) {
  return objectPath.set(this.data, key, val);
};

Config.prototype.persistDefault = function(key, val, callback) {
  if(!this.get(key)) {
    this.set(key, val);
  }
  this._persist(key, val, 'defaults.gen.json', callback);
};

Config.prototype.persistOverride = function(key, val, callback) {
  this.set(key, val);
  this._persist(key, val, 'overrides.gen.json', callback);
};

Config.prototype._persist = function(key, val, file, callback) {

  file = path.join(this.get('genConfigDir'), file);
  //persist into overrides
  //TODO save/flush on app close?

  //force creation
  fs.closeSync(fs.openSync(file, 'a'));

  fs.readFile(file, 'utf-8', function(err, data) {
    if(err) {
      return callback(err);
    }

    var obj = {};
    if(data) {
      obj = JSON.parse(data);
    }

    objectPath.set(obj, key, val);
    fs.writeFile(file, JSON.stringify(obj, null, "  "), callback);
  });
};

Config.prototype.mergeChain = function(chain) {
  var args = [true, {}].concat(chain);
  args.push(this.data);

  this.data = extend.apply(null, args);
};


Config.prototype.initialize = function(init) {
  if(this.initialized) {
    return;
  }
  this.initialized = true;
  init = init || {};

  var chain = [];

  chain.push(_.omit(require('minimist')(process.argv.slice(2)), '_'));
  chain.push(process.env);
  chain.push(init);

  //save chain now to get some initial variables
  this.mergeChain(chain);
  chain = [];
  
  var isDev = this.get('NODE_ENV') ? this.get('NODE_ENV') === 'development' : true;
  var isProd = this.get('NODE_ENV') ? this.get('NODE_ENV') === 'production' : false;
  var env = isDev ? "dev" : 'prod';

  chain.push({
    isDev: isDev,
    isProd: isProd,
    env: env
  });

  //save chain now to get some initial variables
  this.mergeChain(chain);
  chain = [];
  
  //sanitize some important config variables
  var cwd = path.resolve(this.get('cwd') || process.cwd());
  process.chdir(cwd);

  var appRoot = this.get('appRoot') || cwd;
  var configDir = this.getRaw('configDir') || "${appRoot}/config";
  var genConfigDir = this.getRaw('genConfigDir') || configDir;
  
  chain.push({
    appRoot: appRoot,
    configDir: configDir,
    genConfigDir: genConfigDir,
    cwd: cwd
  });
  this.mergeChain(chain);
  chain = [];

  configDir = this.get('configDir');
  genConfigDir = this.get('genConfigDir');
  
  var genDefaults = path.join(genConfigDir, 'defaults.gen.json');
  if(fs.existsSync(genDefaults)) {
    chain.push(this.getFileData(genDefaults));
  }

  var next = path.join(configDir, 'defaults.json');
  while(next && fs.existsSync(next)) {
    var nextConfig = this.getFileData(next);
    chain.push(nextConfig);

    //get next
    var nextName = nextConfig.next;
    if(nextName) {
      if(typeof nextName !== 'string') {
        nextName = nextName[env];
      }

      next = path.join(configDir, nextName);
    } else {
      next = null;
    }
  }

  var overrides = path.join(genConfigDir, 'overrides.gen.json');
  if(fs.existsSync(overrides)) {
    chain.push(this.getFileData(overrides));
  }

  this.mergeChain(chain);
};
  
Config.prototype.getFileData = function(filename) {
  try {
    return JSON.parse(jm.minify(fs.readFileSync(filename, 'utf-8')));
  } catch(err) {
    throw new Error("Failed to parse config file " + filename + ". Caused by: \n" + err.stack);
  }
};

Config.prototype.clear = function() {
  this.data = {};
  this.initialized = false;
};


module.exports = Config;

