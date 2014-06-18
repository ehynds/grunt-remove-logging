exports.init = function(grunt) {
  "use strict";

  var _ = grunt.util._;

  return function(src, opts) {
    var counter = 0;
    var rConsole;

    // Use console as the default namespace
    if(!("namespace" in opts)) {
      opts.namespace = [ "console", "window.console" ];
    }

    // Default methods
    if(!("methods" in opts) || !_.isArray(opts.methods)) {
      opts.methods = "log info warn error assert count clear group groupEnd groupCollapsed trace debug dir dirxml profile profileEnd time timeEnd timeStamp table exception".split(" ");
    }

    rConsole = new RegExp("(" + opts.namespace.join("|") + ")" + ".(?:" + opts.methods.join("|") + ")\\s{0,}\\([^;]*\\)(?!\\s*[;,]?\\s*\\/\\*\\s*RemoveLogging:skip\\s*\\*\\/)\\s{0,};?", "gi");

    src = src.replace(rConsole, function() {
      var type = grunt.option('type') || "comment";
      var matches = src.match(rConsole);
      if(type === 'comment'){
        var commented = [];
        counter++;
        for(var i = 0; i < matches.length; i++){
          commented[i] = "//" + matches[i];
          return commented[i];
        }       
      }else {
        counter++;
        return opts.replaceWith || "";
      }
    });
    return {
      src: src,
      count: counter
    };
  };
};
