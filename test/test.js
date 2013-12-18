(function(require) {

  "use strict";

  var grunt = require("grunt");
  var util = require("util");
  var task = require("../tasks/lib/removelogging").init(grunt);
  var async = grunt.util.async;

  function formatExpected(formatter, expected) {
    var args = [ formatter ];
    var numParams = (formatter.match(/%(s|d|j)/g) || []).length;

    for (var i = 0; i < numParams; i++) {
      args.push(expected);
    }

    return util.format.apply(global, args);
  }

  var generalTests = [
    ['console.log("foo (inner parens)")', ""],
    ['console.log(foo); bar; console.warn("bar")', ' bar; '],
    ['console.dir({ complex: "objects" }, [ "array" ])', ""],
    ['console.log("foo (inner parens)");foo;console.warn("(lol)")', "foo;"],
    [';if(true){functionCall(function namedFun(){console.log("test", args);})};for(var x=1;x<foo.length;x++){fun(){console.warn("foo")}};', ';if(true){functionCall(function namedFun(){})};for(var x=1;x<foo.length;x++){fun(){}};',],
  ];

  var skipRemovalTests = [
    ['console.log("foo")/*RemoveLogging:skip*/', 'console.log("foo")/*RemoveLogging:skip*/'],
    ['console.log("foo");/*RemoveLogging:skip*/', 'console.log("foo");/*RemoveLogging:skip*/'],
    ['bar;console.log("foo")/*RemoveLogging:skip*/', 'bar;console.log("foo")/*RemoveLogging:skip*/'],
    ['bar;console.log("foo")/*RemoveLogging:skip*/;', 'bar;console.log("foo")/*RemoveLogging:skip*/;'],
    ['bar;console.log("foo")/*RemoveLogging:skip*/bar;', 'bar;console.log("foo")/*RemoveLogging:skip*/bar;'],
    ['console.log("foo");/*RemoveLogging:skip*/console.log("bar");', 'console.log("foo");/*RemoveLogging:skip*/'],
    ['bar;console.log("foo")/*RemoveLogging:skip*/;console.log("bar");', 'bar;console.log("foo")/*RemoveLogging:skip*/;%s'],
    ['bar;console.log("foo") /*RemoveLogging:skip*/;foo;console.log("bar");', 'bar;console.log("foo") /*RemoveLogging:skip*/;foo;'],
    ['bar;console.log("foo") /* RemoveLogging:skip */;foo;console.log("bar");', 'bar;console.log("foo") /* RemoveLogging:skip */;foo;'],
    ['bar;console.log("foo")/*RemoveLogging:skip*/;console.log("bar");function(){console.warn("baz");}', 'bar;console.log("foo")/*RemoveLogging:skip*/;function(){}'],
    ['bar;console.log("foo")/*RemoveLogging:skip*/;console.log("bar");function(){console.warn("baz");/*RemoveLogging:skip*/}', 'bar;console.log("foo")/*RemoveLogging:skip*/;function(){console.warn("baz");/*RemoveLogging:skip*/}'],
  ];

  var namespaceTests = [
    ['console.log("foo");logger.log("foo");that.log("foo");this.log("foo")', 'console.log("foo");']
  ];

  var methodTests = [
    ['console.log("foo");console.error("bar");console.warn("baz");', '%sconsole.error("bar");%s']
  ];

  var replaceWithTests = [
    ['console.error()', '%s'],
    ['console.log(foo)', '%s'],
    ['console.warn(foo)', '%s'],
    ['console.log(foo);', '%s'],
    ['console.warn("foo")', '%s'],
    ['console.log("foo") ;', '%s'], // #14 - space between ) and ;
    ['console.log ("foo");', '%s'],
    [' console.group("foo")', ' %s'],
    ['console.groupEnd(\'foo\')', '%s'],
    ['pre console.warn(foo) post', 'pre %spost'],
    ['console.log ( "foo" );post', '%spost'],
    ['pre console.warn(foo); post', 'pre %s post'],
    ['console && console.log("hi")', 'console && %s'],
    ['pre;console.log("foo") ;post;', 'pre;%spost;'], // #14 - space between ) and ;
    ['pre console.log(foo + bar) post', 'pre %spost'],
    ['pre;console.log    ("foo");post;', 'pre;%spost;'],
    ['console.log(arg1, arg2, "foo", arg4)', '%s'],
    ['console.dir("Testing " + foo, bar);foo;', '%sfoo;']
  ];

  /**
   * Outputs an array of test configurations
   * @param  {string} test An array of tests templates
   * @param  {string} options The options to apply
   * @return {array}             The array of tests configurations
   */
  function generateTestSet(tests, options) {
    var expected = (options && options.replaceWith) || ''; // default is ""
    return tests.map(function(test) {
      return [
        test[0], // string to test
        options,
        formatExpected(test[1], expected) // expected output
      ];
    });
  }

  // each item in the array is a test.
  // the convention is:
  // [
  //    string to test,
  //    options to pass to the remove_logging helper
  //    expected result
  // ]
  var tests = [];

  tests = tests.concat(generateTestSet(generalTests, {}));
  tests = tests.concat(generateTestSet(skipRemovalTests, {}));
  tests = tests.concat(generateTestSet(namespaceTests, { namespace: ['logger', 'that', 'this'] }));
  tests = tests.concat(generateTestSet(methodTests, { methods: [ 'log', 'warn' ]}));
  tests = tests.concat(generateTestSet(replaceWithTests, { replaceWith: "" }));


  exports.tests = {
    setUp: function(done) {
      done();
    },

    remove_logging: function(test) {
      test.expect(tests.length);

      tests.forEach(function(t) {
        var result = task(t[0], t[1]);
        test.equal(result.src, t[2]);
      });

      test.done();
    }
  };

})(require);