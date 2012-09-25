var grunt = require("grunt");
var task = require("../tasks/grunt-remove-logging");
var async = grunt.utils.async;

// each item in the array is a test.
// the convention is:
// [
//    string to test,
//    options to pass to the remove_logging helper
//    expected result
// ]
var tests = [
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
    "pre  post"
  ],
  [
    'pre console.log(foo + bar) post',
    { replaceWith: "" },
    "pre  post"
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
  ]
];

exports.tests = {
  setUp: function(done) {
    done();
  },

  remove_logging: function(test) {
    test.expect(tests.length);

    tests.forEach(function(t) {
      test.equal(grunt.helper("removelogging", t[0], t[1]), t[2]);
    });

    test.done();
  }
  
};
