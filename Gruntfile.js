module.exports = function(grunt) {

  var config = {
    files: [ "Gruntfile.js", "tasks/**/*.js", "test/**/*.js" ]
  };

  // Project configuration.
  grunt.initConfig({
    nodeunit: {
      all: ["test/**/*.js"]
    },
    watch: {
      files: config.files,
      tasks: "default"
    },
    jshint: {
      all: config.files
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-nodeunit");
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.registerTask("default", ["jshint", "nodeunit"]);
};
