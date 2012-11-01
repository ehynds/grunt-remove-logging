/*
 * Grunt Remove Logging
 * https://github.com/ehynds/grunt-remove-logging
 *
 * Copyright (c) 2012 Eric Hynds
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
  "use strict";

  var _ = grunt.utils._;

  grunt.registerMultiTask("removelogging", "Remove console logging", function() {
    var src = grunt.task.directive(this.file.src, grunt.file.read);
    var opts = this.data.options;
    var result = grunt.helper("removelogging", src, opts);
    grunt.log.writeln("Removed " + result.count + " logging statements from " + this.file.src);
    grunt.file.write(this.file.dest, result.src);
  });

  grunt.registerHelper("removelogging", function(src, opts) {
    var counter = 0;
    var rConsole;

    if(!opts) {
      opts = {};
    }

    // Use console as the default namespace
    if(!("namespace" in opts)) {
      opts.namespace = "console";
    }

    // Default methods
    if(!("methods" in opts) || !_.isArray(opts.methods)) {
      opts.methods = "log warn error assert count clear group groupEnd groupCollapsed trace debug dir dirxml profile profileEnd time timeEnd timeStamp table exception".split(" ");
    }

    rConsole = new RegExp(opts.namespace + ".(?:" + opts.methods.join("|") + ")\\([^;]*\\)(?!\\s*[;,]?\\s*\\/\\*\\s*RemoveLogging:skip\\s*\\*\\/);?", "gi");
    
    src = src.replace(rConsole, function() {
      counter++;
      return opts.replaceWith || "";
    });

    return {
      src: src,
      count: counter
    };
  });

};
