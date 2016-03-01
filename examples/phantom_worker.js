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
var pdbidListPath = args.length > 4 ? args[ 4 ] : "";
var timeoutMs = args.length > 5 ? args[ 5 ] : Infinity;

var pdbidList;
if( pdbidListPath ){
    pdbidList = fs.read( pdbidListPath );
    console.log( "loaded pdb id list from file" );
}

if( [ "false", "0", "f", "no" ].indexOf( cAlphaOnly ) !== -1 ) cAlphaOnly = false;
if( [ "true", "1", "t", "yes" ].indexOf( cAlphaOnly ) !== -1 ) cAlphaOnly = true;


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

            var completed = page.evaluate( function( __pdbidCount__, __cAlphaOnly__, __pdbidList__ ){
                var statusJsonText = document.getElementById( "statusJson" ).innerText;
                var statusInfoText = document.getElementById( "statusInfo" ).innerText;
                if( __pdbidList__ && !statusInfoText ){
                    console.log( "starting decoding" );
                    var idList = JSON.parse( __pdbidList__ ).idList;
                    load( getRandomPdbIdList( __pdbidCount__, idList ), __cAlphaOnly__ );
                }else if( fullPdbIdList === undefined || fullPdbIdList.length === 0 ){
                    console.log( "waiting for fullPdbIdList" );
                }else if( !__pdbidList__ && !statusInfoText ){
                    console.log( "starting decoding" );
                    loadRandom( __pdbidCount__, __cAlphaOnly__ );
                }
                if( statusJsonText ){
                    var statusJson = JSON.parse( statusJsonText );
                    var completed = statusJson.finished + statusJson.failed;
                    if( statusJson.requested === completed ){
                        console.log( "finished decoding" );
                        return true;
                    }else{
                        return completed;
                    }
                }
                return false;
            }, pdbidCount, cAlphaOnly, pdbidList );

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
