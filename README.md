## About

This task removes all console logging statements from your source code.

## Getting Started

Install this plugin with: `grunt install grunt-remove-logging`

Next, add this line to your project's `grunt.js` file:

`grunt.loadNpmTasks("grunt-remove-logging");`

Lastly, add the configuration settings (see below) to your grunt.js file.

## Documentation

This task has two required properties, `src` and `dest`. `src` is the path to your source file and `dest` is the file this task will write to (relative to the grunt.js file). If this file already exists **it will be overwritten**.

An example configuration looks like this:

```` javascript
grunt.initConfig({
  removelogging: {
    dist: {
      src: "js/application.js",
      dest: "js/application-clean.js",

      options: {
        // see below for options. this is optional.
      }
    }
  }
});
````

### Optional Configuration Properties

This plugin can be customized by specifying the following options:

* `replaceWith`: A value to replace console.logging statements with. This defaults to an empty string. If you use fancy statements like `console && console.log("foo");`, you may choose to specify a replaceWith value like `0;` so that your scripts don't completely break.
* `namespace`: The name of object where logging methods are attached. Defaults to `console`.
* `methods`: An array of the method names to remove. Defaults to [all the methods](http://getfirebug.com/wiki/index.php/Console_API) in the Firebug console API. This option is useful if you want to strip out all `log` methods, but keep `warn`.

### Skipping Individual Statements

You can tell this task to keep specific logging statements by adding the comment `/*RemoveLogging:skip*/` after the statement:

console.log("foo");/*RemoveLogging:skip*/

- or -

console.log("foo")/*RemoveLogging:skip*/;
