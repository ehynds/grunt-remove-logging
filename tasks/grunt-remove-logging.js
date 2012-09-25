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
    grunt.file.write(this.file.dest, grunt.helper("removelogging", src, opts));
  });

  grunt.registerHelper("removelogging", function(src, opts) {
    if(!opts) {
      opts = {};
    }

    return src.replace(rConsole, opts.replaceWith || "");
  });

};
