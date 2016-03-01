"use strict";

// adapted from https://github.com/ariya/phantomjs/blob/master/examples/run-qunit.js

var fs = require('fs');
var system = require('system');
var page = require('webpage').create();
var url = 'worker.html';
// var url = 'http://localhost:8080/MMTF-Decoder-JavaScript/examples/worker.html?count=100';

var args = system.args;

var pdbidCount = args.length > 1 ? args[ 1 ] : 100;
var outputDir = args.length > 2 ? args[ 2 ] : ".";
var cAlphaOnly = args.length > 3 ? args[ 3 ].toLowerCase() : false;
var timeoutMs = args.length > 4 ? args[ 4 ] : Infinity;

if( [ "false", "0", "f", "no" ].indexOf( cAlphaOnly ) !== -1 ) cAlphaOnly = false;
if( [ "true", "1", "t", "yes" ].indexOf( cAlphaOnly ) !== -1 ) cAlphaOnly = true;

/**
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param timeOutMillis the max amount of time to wait. If not specified, Infinity sec is used.
 */
function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : Infinity;
    var start = new Date().getTime();
    var condition = false;
    var interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 500);
};

page.onConsoleMessage = function(msg, lineNum, sourceId) {
    console.log('CONSOLE: ' + msg);
};

page.open(url, function (status) {
    if (status !== "success") {
        console.log("Unable to access network", status);
        phantom.exit(1);
    } else {
        var prevCompleted;
        waitFor(function(){
            var completed = page.evaluate( function( __pdbidCount__, __cAlphaOnly__ ){
                var statusJsonText = document.getElementById( "statusJson" ).innerText;
                if( fullPdbIdList === undefined || fullPdbIdList.length === 0 ){
                    console.log( "waiting for fullPdbIdList" );
                }else if( statusJsonText ){
                    var statusJson = JSON.parse( statusJsonText );
                    var completed = statusJson.finished + statusJson.failed;
                    if( statusJson.requested === completed ){
                        console.log( "finished decoding" );
                        return true;
                    }else{
                        return completed;
                    }
                }else if( !document.getElementById( "statusInfo" ).innerText ){
                    console.log( "starting decoding" );
                    loadRandom( __pdbidCount__, __cAlphaOnly__ );
                }
                return false;
            }, pdbidCount, cAlphaOnly);
            if( completed === true ){
                return true;
            }else{
                if( completed && completed !== prevCompleted ){
                    page.evaluate(function(){
                        console.log( document.getElementById( "statusInfo" ).innerText );
                    });
                    prevCompleted = completed;
                }
                return false;
            }
        }, function(){
            fs.write(fs.join(outputDir, "status.txt"), page.evaluate( function(){
                console.log( document.getElementById( "statusInfo" ).innerText );
                return document.getElementById( "statusInfo" ).innerText
            } ), 'w');

            fs.write(fs.join(outputDir, "statsList.json"), page.evaluate(function(){
                return document.getElementById( "statsListJson" ).innerText
            } ), 'w');

            fs.write(fs.join(outputDir, "statsSum.json"), page.evaluate( function(){
                return document.getElementById( "statsSumJson" ).innerText
            } ), 'w');

            fs.write(fs.join(outputDir, "statsAvg.json"), page.evaluate( function(){
                return document.getElementById( "statsAvgJson" ).innerText
            } ), 'w');

            fs.write(fs.join(outputDir, "errors.json"), page.evaluate(function(){
                return document.getElementById( "errorsJson" ).innerText
            } ), 'w');

            phantom.exit(0);
        }, timeoutMs );
    }
});
