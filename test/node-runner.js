
var testrunner = require("qunit");

testrunner.run([
    {
        code: {
            path: "../build/cjs/msgpack-decode.js",
            namespace: "decodeMsgpack"
        },
        tests: "tests-msgpack-decode.js"
    },
    {
        code: {
            path: "../build/cjs/mmtf-decode-helpers.js"
        },
        tests: "tests-mmtf-decode-helpers.js"
    },
    {
        dep: "check-helpers.js",
        code: {
            path: "../build/cjs/mmtf-decode.js",
            namespace: "decodeMmtf"
        },
        tests: "tests-mmtf-decode.js"
    },
    {
        dep: [
            "check-helpers.js",
            "../build/cjs/mmtf-decode-helpers.js"
        ],
        code: {
            path: "../build/cjs/mmtf-decode.js",
            namespace: "decodeMmtf"
        },
        tests: "tests-functional.js"
    }
]);
