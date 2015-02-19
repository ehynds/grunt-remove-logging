"use strict";

var grunt = require("grunt");
var task = require("../tasks/lib/removelogging").init(grunt);
var async = grunt.util.async;

// each item in the array is a test.
// the convention is:
// [
//    string to test,
//    options to pass to the remove_logging helper
//    expected result
// ]
var tests = [
  [
    'console.log(foo); bar; console.warn("bar")',
    {},
    " bar; "
  ],
  [
    'console.dir({ complex: "objects" }, [ "array" ])',
    {},
    ""
  ],
  [
    'console.log("foo (inner parens)")',
    {},
    ""
  ],
  [
    'console.log("foo (inner parens)");foo;console.warn("(lol)")',
    {},
    "foo;"
  ],
  [
    ';if(true){functionCall(function namedFun(){console.log("test", args);})};for(var x=1;x<foo.length;x++){fun(){console.warn("foo")}};',
    {},
    ';if(true){functionCall(function namedFun(){})};for(var x=1;x<foo.length;x++){fun(){}};',
  ],

  // remove logging directive tests
  
  [
    'console.log("foo");/*RemoveLogging:skip*/',
    {},
    'console.log("foo");/*RemoveLogging:skip*/',
  ],
  [
    'console.log("foo")/*RemoveLogging:skip*/',
    {},
    'console.log("foo")/*RemoveLogging:skip*/',
  ],
  [
    'bar;console.log("foo")/*RemoveLogging:skip*/',
    {},
    'bar;console.log("foo")/*RemoveLogging:skip*/',
  ],
  [
    'bar;console.log("foo")/*RemoveLogging:skip*/bar;',
    {},
    'bar;console.log("foo")/*RemoveLogging:skip*/bar;',
  ],
  [
    'bar;console.log("foo")/*RemoveLogging:skip*/;console.log("bar");',
    {},
    'bar;console.log("foo")/*RemoveLogging:skip*/;',
  ],
  [
    'bar;console.log("foo")/*RemoveLogging:skip*/;',
    {},
    'bar;console.log("foo")/*RemoveLogging:skip*/;',
  ],
  [
    'bar;console.log("foo") /*RemoveLogging:skip*/;foo;console.log("bar");',
    {},
    'bar;console.log("foo") /*RemoveLogging:skip*/;foo;',
  ],
  [
    'bar;console.log("foo") /* RemoveLogging:skip */;foo;console.log("bar");',
    {},
    'bar;console.log("foo") /* RemoveLogging:skip */;foo;',
  ],
  [
    'console.log("foo");/*RemoveLogging:skip*/console.log("bar");',
    {},
    'console.log("foo");/*RemoveLogging:skip*/',
  ],
  [
    'bar;console.log("foo")/*RemoveLogging:skip*/;console.log("bar");function(){console.warn("baz");}',
    {},
    'bar;console.log("foo")/*RemoveLogging:skip*/;function(){}',
  ],
  [
    'bar;console.log("foo")/*RemoveLogging:skip*/;console.log("bar");function(){console.warn("baz");/*RemoveLogging:skip*/}',
    {},
    'bar;console.log("foo")/*RemoveLogging:skip*/;function(){console.warn("baz");/*RemoveLogging:skip*/}',
  ],

  // namespace option tests

  [
    'logger.log("foo");that.log("foo");this.log("foo")',
    { namespace: ['logger', 'that', 'this'] },
    '',
  ],

  // methods option tests

  [
    'console.log("foo");console.error("bar");console.warn("baz");',
    { methods: [ 'log', 'warn' ]},
    'console.error("bar");',
  ],

  // replaceWidth option tests

  [
    'console.log(foo);',
    { replaceWith: "" },
    ""
  ],
  [
    'console.log(foo)',
    { replaceWith: "0;" },
    "0;"
  ],
  [
    'console.warn("foo")',
    { replaceWith: "" },
    ""
  ],
  [
    ' console.group("foo")',
    { replaceWith: "" },
    " "
  ],
  [
    'console.groupEnd(\'foo\')',
    { replaceWith: "" },
    ""
  ],
  [
    'console.error()',
    { replaceWith: "" },
    ""
  ],
  [
    'console.log(arg1, arg2, "foo", arg4)',
    { replaceWith: "" },
    ""
  ],
  [
    'console.warn(foo)',
    { replaceWith: "" },
    ""
  ],
  [
    'pre console.warn(foo); post',
    { replaceWith: "" },
    "pre  post"
  ],
  [
    'pre console.warn(foo) post',
    { replaceWith: "" },
    "pre post"
  ],
  [
    'pre console.log(foo + bar) post',
    { replaceWith: "" },
    "pre post"
  ],
  [
    'console.dir("Testing " + foo, bar);foo;',
    { replaceWith: "bar;" },
    "bar;foo;"
  ],
  [
    'console && console.log("hi")',
    { replaceWith: "0;" },
    "console && 0;"
  ],
  [
    'console.log ("foo");',
    { replaceWith: "" },
    ""
  ],
  [
    'pre;console.log    ("foo");post;',
    { replaceWith: "" },
    "pre;post;"
  ],
  [
    'console.log ( "foo" );post',
    { replaceWith: "" },
    "post"
  ],

  // Issue #14 - space between ) and ;
  [
    'console.log("foo") ;',
    { replaceWith: "" },
    ""
  ],
  [
    'pre;console.log("foo") ;post;',
    { replaceWith: "" },
    "pre;post;"
  ],

  // Issue #18 - no ';' at line end breaking code
  [
    'var xxxx;console.log()\n',
    { methods: [ 'log' ], forceProperLineEnd: true },
    "var xxxx;\n"
  ],
  [ // if the keyword "function(" is found on the same line, it will ignore it
    'var xxxx;console.log = function()\n',
    { methods: [ 'log' ], forceProperLineEnd: true },
    "var xxxx;console.log = function()\n"
  ],
  [
    'var xxxx;console.log();\n',
    { methods: [ 'log' ] },
    "var xxxx;\n"
  ],
  // testing actual JS files, so that any discrepencies between OSs and line breaks can be captured
  [
    grunt.file.read("./test/samples/sample1-before.js"),
    { methods: [ 'log' ] },
    grunt.file.read("./test/samples/sample1-after.js")
  ],
  [
    grunt.file.read("./test/samples/sample2-before.js"),
    { methods: [ 'log' ] },
    grunt.file.read("./test/samples/sample2-after.js")
  ],
  [
    'var xxxx;console.warn()\n',
    { methods: [ 'warn' ], forceProperLineEnd: true },
    "var xxxx;\n"
  ],
  [
    'var xxxx;console.warn();\n',
    { methods: [ 'warn' ] },
    "var xxxx;\n"
  ]
];

exports.tests = {
  setUp: function(done) {
    done();
  },

  remove_logging: function(test) {
    test.expect(tests.length);

    tests.forEach(function(t, i) {
      var result = task(t[0], t[1], "test"+i);
      test.equal(result.src, t[2]);
    });

    test.done();
  }
};
