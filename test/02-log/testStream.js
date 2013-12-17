
var through = require('through');


var self = module.exports = through(function(data) {
  self.callback(data);
});

self.callback = function() {};