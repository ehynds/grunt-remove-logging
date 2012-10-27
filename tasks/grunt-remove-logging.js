/*
 * Grunt Remove Logging
 * https://github.com/ehynds/grunt-remove-logging
 *
 * Copyright (c) 2012 Eric Hynds
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
  "use strict";

  var rConsole = /console.(?:log|warn|error|assert|count|clear|group|groupEnd|trace|debug|dir|dirxml|profile|profileEnd|time|timeEnd)\([^;]*\);?/gi;

  grunt.registerMultiTask("removelogging", "Remove console logging", function() {
    var src = grunt.task.directive(this.file.src, grunt.file.read);
    var opts = this.data.options;
    var result = grunt.helper("removelogging", src, opts);
    grunt.log.writeln("Removed " + result.count + " logging statements from " + this.file.src);
    grunt.file.write(this.file.dest, result.src);
  });

  grunt.registerHelper("removelogging", function(src, opts) {
    var counter = 0;

    if(!opts) {
      opts = {};
    }

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
