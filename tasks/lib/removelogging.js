exports.init = function(grunt) {
  "use strict";

  var _ = grunt.util._;

  return function(src, opts, origin) {
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

    if(!("verbose" in opts)) {
      opts.verbose = true;
    }

    /**
     * This condition will check all console statement lines to see if they end with a semi-colon and throw warning if
     * they don't, with a message pointing to the location of the problem. 
     * By default it doesn't fix the problem for you, just points you in the direction of the problem so you can fix your code.
     * If option 'forceProperLineEnd' is set to true though, it will add the semi-colon to the end of the line.
     * Addresses issue 18: https://github.com/ehynds/grunt-remove-logging/issues/18
     */
    if( _.isArray(opts.methods) ) {
      opts.methods.forEach(function(meth) {

        var splitter = "console."+meth,
            newSrc = "";
        src.split( splitter ).forEach(function(str, i) {

          newSrc += (i>0 ? splitter : "");

          var modStr = null;

          if( i>0 && str.indexOf("\n") !== -1 ) {
            var thisLine = str.split("\n")[0].trim(),
              lastChar = thisLine[ thisLine.length-1 ];

            if( thisLine.indexOf("RemoveLogging:skip") === -1 && lastChar !== ";" && thisLine.indexOf("function(") === -1 ) {
              if( opts.forceProperLineEnd ) {

                modStr = str.replace( "\n", ";\n" );
                
                grunt.log.warn( "WARNING: Added semi-colon to line ".yellow +
                  "\nconsole.".cyan + meth.cyan + thisLine.cyan +
                  "\nIn file ".yellow + origin.yellow + 
                  "\n\n" );
              } else {
                grunt.log.warn( "WARNING: line with console statement does not finish with ';'. ".red+
                  "This will likely cause unexpected results in 'grunt-remove-logging'.".red+
                  "\nIn file ".yellow + origin.yellow + ", search for the following string to debug it: ".yellow + 
                  "\nconsole.".cyan + meth.cyan + thisLine.cyan+
                  "\n\n" );
              }
            }
          }

          newSrc += modStr || str;
          
        });

        if( newSrc !== "" ) {
          src = newSrc;
        }
      
      });
    }

    rConsole = new RegExp("(" + opts.namespace.join("|") + ")" + ".(?:" + opts.methods.join("|") + ")\\s{0,}\\([^;]*\\)(?!\\s*[;,]?\\s*\\/\\*\\s*RemoveLogging:skip\\s*\\*\\/)\\s{0,};?", "gi");

    src = src.replace(rConsole, function() {
      counter++;
      return opts.replaceWith || "";
    });

    return {
      src: src,
      count: counter
    };
  };
};
