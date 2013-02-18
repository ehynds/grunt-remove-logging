/*
 * Grunt Remove Logging
 * https://github.com/ehynds/grunt-remove-logging
 *
 * Copyright (c) 2013 Eric Hynds
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
  "use strict";

  var task = require("./lib/removelogging").init(grunt);

  grunt.registerMultiTask("removelogging", "Remove console logging", function() {
    var opts = this.options();

    this.files.forEach(function(f) {
      var ret = f.src.map(function(srcFile) {
        var result = task(grunt.file.read(srcFile), opts);
        grunt.log.writeln("Removed " + result.count + " logging statements from " + srcFile);
        return result.src;
      }).join("");

      grunt.file.write(f.dest, ret);
    });
  });
};
