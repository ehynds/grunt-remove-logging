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

  function iterateTests(arr, test) {
    arr.forEach(function(t) {
      var result = task(t[0], t[1]);
      test.equal(result.src, t[2]);
    });
  }

  ////////////////////////////////////////////////////////////////////////////////////////
  ///
  ///   Test Templates
  ///   
  ///   Each of these should have 2 values.
  ///   The first is the input to test; the second
  ///   is the expected output.
  ///     
  ///     [ (str)INPUT_TO_TEST, (str)EXPECTED_OUTPUT ]
  ///     
  ///   Note: You can use %s for use with the replaceWith option.
  ///   
  ///
  ////////////////////////////////////////////////////////////////////////////////////////

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

  var generalTests = [
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
    ['console.log("foo (inner parens)")', '%s'],
    ['console.log(arg1, arg2, "foo", arg4)', '%s'],
    ['console.dir("Testing " + foo, bar);foo;', '%sfoo;'],
    ['console.log(foo); bar; console.warn("bar")', '%s bar; %s'],
    ['console.dir({ complex: "objects" }, [ "array" ])', '%s'],
    ['console.log("foo (inner parens)");foo;console.warn("(lol)")', '%sfoo;%s'],
    [';if(true){functionCall(function namedFun(){console.log("test", args);})};for(var x=1;x<foo.length;x++){fun(){console.warn("foo")}};', ';if(true){functionCall(function namedFun(){%s})};for(var x=1;x<foo.length;x++){fun(){%s}};']
  ];

  /**
   * Outputs an array of test configurations
   * @param  {array}  tests      An array of tests templates
   * @param  {object} options    The options to apply
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

  exports.remove_logging = {
    setUp: function(done) {
      done();
    },

    'mapper-function': function(test) {
      test.expect(1);

      test.equal(generateTestSet(generalTests).length, generalTests.length);

      test.done();
    },

    general: function(test) {
      test.expect(generalTests.length);

      iterateTests(generateTestSet(generalTests, {}), test);

      test.done();
    },

    'skip-removal': function(test) {
      test.expect(skipRemovalTests.length);

      iterateTests(generateTestSet(skipRemovalTests, {}), test);

      test.done();
    },

    'namespace': function(test) {
      test.expect(namespaceTests.length);

      iterateTests(generateTestSet(namespaceTests, { namespace: ['logger', 'that', 'this'] }), test);

      test.done();
    },

    'methods': function(test) {
      test.expect(methodTests.length);

      iterateTests(generateTestSet(methodTests, { methods: [ 'log', 'warn' ]}), test);

      test.done();
    },

    'replaceWith': function(test) {
      test.expect(generalTests.length * 2);

      iterateTests(generateTestSet(generalTests, { replaceWith: '' }), test);
      iterateTests(generateTestSet(generalTests, { replaceWith: '0;' }), test);

      test.done();
    }
  };

})(require);