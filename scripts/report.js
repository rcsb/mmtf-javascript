
var fs = require('fs');
var request = require('request');
var http = require('http');
var now = require("performance-now");
var Promise = require('promise');
var csvWriter = require('csv-write-stream');
var ArgumentParser = require('argparse').ArgumentParser;

var Queue = require('./lib/queue');
var io = require('./lib/io');
var mmtf = require('./lib/mmtf');

//

function getSummary (data, params) {
    var t0 = now();
    var p = Object.assign({}, params);
    return mmtf.decodeMsgpack(data).then(function(decodedMsgpack){
        var t1 = now();
        return mmtf.decodeMmtf(decodedMsgpack).then(function(decodedMmtf){
            var t2 = now();
            var md = decodedMmtf;
            if(p.storeMmtf){
                io.writeBinary(md.structureId + ".mmtf", data);
            }
            if(p.storeJson){
                io.writeMmtfJson(md.structureId + ".json", decodedMmtf);
            }
            if(p.storeJsonEncoded){
                io.writeEncodedMmtfJson(md.structureId + ".encoded.json", decodedMsgpack)
            }
            return {
                decodeMsgpackMs: t1-t0,
                decodeMmtfMs: t2-t1,
                numBonds: md.numBonds,
                numAtoms: md.numAtoms,
                numGroups: md.numGroups,
                numChains: md.numChains,
                numModels: md.numModels,
            };
        });
    });
}

function getFileSummary (file, params) {
    var t0 = now();
    return io.readFile(file).then(function(data){
        var t1 = now();
        return getSummary(data, params).then(function(summary){
            summary.readFileMs = t1-t0;
            return summary;
        });
    });
}

function getUrlSummary (url, params) {
    var t0 = now();
    return io.loadUrl(url, params).then(function(data){
        var t1 = now();
        return getSummary(data, params).then(function(summary){
            summary.loadUrlMs = t1-t0;
            return summary;
        });
    });
}

function getPdbidSummary(pdbid, params){
    var url = mmtf.FULL_URL + pdbid;
    return getUrlSummary(url, params);
}

function combineSummaryList(list){
    var combinedSummary = {
        decodeMsgpackMs: 0,
        decodeMmtfMs: 0,
        readFileMs: 0,
        loadUrlMs: 0,
        numBonds: 0,
        numAtoms: 0,
        numGroups: 0,
        numChains: 0,
        numModels: 0
    };
    list.forEach(function(summary){
        for (var name in combinedSummary) {
            if (summary[ name ]!==undefined) {
                combinedSummary[ name ] += summary[ name ];
            }
        }
    });
    if(combinedSummary.readFileMs===0) delete combinedSummary.readFileMs;
    if(combinedSummary.loadUrlMs===0) delete combinedSummary.loadUrlMs;
    return combinedSummary;
}

function getRandomPdbidList( count, list ){
    var pdbidList;
    if( count === 0 || count === true || count === "all" || count === list.length ){
        pdbidList = list;
    }else{
        pdbidList = [];
        for( var i = 0; i < count; ++i ){
            var index = Math.floor( Math.random() * list.length );
            pdbidList.push( list[ index ] );
        }
    }
    return pdbidList;
}

function loadPdbidList(){
    return new Promise(function (resolve, reject) {
        var options = {
            url: "http://www.rcsb.org/pdb/json/getCurrent",
            json:true
        }
        request.get(options, function(err, response, body){
            if(err){
                reject(err);
            }else{
                resolve(body.idList);
            }
        });
    });
}

function getListSummary( list, promiseFn, params ){
    var t0 = now();
    var p = Object.assign({}, params);
    var summaryPath = p.summaryPath || 'summary.txt';
    var errorPath = p.errorPath || 'error.txt';
    var reportPath = p.reportPath || 'report.csv';
    var printFrequency = p.printFrequency!==0 ? 1000 : false;
    var chunkSize = p.chunkSize || 100;
    return new Promise(function (resolve, reject) {
        var summaryList = [];
        var reportFile = csvWriter();
        reportFile.pipe(fs.createWriteStream(reportPath));
        var errorFile = fs.createWriteStream(errorPath);
        var summaryFile = fs.createWriteStream(summaryPath);
        var count = 0;
        var failCount = 0;
        var successCount = 0;
        var chunkList = [];
        for( var i = 0, il = list.length; i < il; i += chunkSize ){
            chunkList.push( i );
        }
        var queue = new Queue( function( start, callback ){
            var listChunk = list.slice( start, start + chunkSize );
            Promise.all(listChunk.map(function(value){
                return promiseFn(value, params).then(function(summary){
                    count += 1;
                    successCount += 1;
                    summaryList.push(summary);
                    reportFile.write(Object.assign({id: value}, summary));
                    if(printFrequency!==false && count % printFrequency === 0){
                        console.log([value, count, now()-t0]);
                    }
                }).catch(function(err){
                    count += 1;
                    failCount += 1;
                    errorFile.write("[" + value + "] " + err + "\n");
                });
            })).then( function(){
                if( queue.length() === 0 ){
                    var summary = combineSummaryList(summaryList);
                    summary.overallMs = now()-t0;
                    summary.failCount = failCount;
                    summary.successCount = successCount;
                    for (var name in summary) {
                        summaryFile.write(name + ": " + summary[name] + "\n");
                    }
                    reportFile.end();
                    errorFile.end();
                    summaryFile.end();
                    resolve(summary);
                }
                callback();
            }).catch(function(err){
                reportFile.end();
                errorFile.end();
                summaryFile.end();
                throw err;
                callback();
            });
        }, chunkList );
    });
}

function getFileListSummary( fileList, params ){
    var t0 = now();
    var p = Object.assign({}, params);
    return getListSummary(fileList, getFileSummary, p);
}

function getUrlListSummary( urlList, params ){
    var p = Object.assign({}, params);
    var pool = new http.Agent();
    pool.maxSockets = 5;
    pool.maxFreeSockets = 5;
    p.pool = pool;
    return getListSummary(urlList, getUrlSummary, p);
}

function getPdbidListSummary( pdbidList, params ){
    var p = Object.assign({}, params);
    var pool = new http.Agent();
    pool.maxSockets = 5;
    pool.maxFreeSockets = 5;
    p.pool = pool;
    return getListSummary(pdbidList, getPdbidSummary, p);
}

//

var parser = new ArgumentParser({
    version: '0.0.2',
    addHelp:true,
    description: 'Get MMTF files, decode them and report back statistics. Optionally store them.'
});
parser.addArgument( '--file', {
    help: 'file path',
    nargs: "*"
});
parser.addArgument( '--url', {
    help: 'url',
    nargs: "*"
});
parser.addArgument('--pdbid', {
    help: 'list of pdb ids',
    nargs: "*"
});
parser.addArgument( '--archive', {
    help: 'number of pdb ids, 0 for all',
    type: parseInt
});
parser.addArgument( '--timeout', {
    help: 'timeout in ms for url requests (default: 1000)',
    defaultValue: 1000,
    type: parseInt
});
parser.addArgument( '--chunkSize', {
    help: 'number of concurrent elements in processing queue; to get accurate download numbers, set to 1 (default: 100)',
    defaultValue: 100,
    type: parseInt
});
parser.addArgument( '--printFrequency', {
    help: 'frequency of messages to the console (default: 1000)',
    defaultValue: 1000,
    type: parseInt
});
parser.addArgument( '--printSummary', {
    help: 'print summary on finish',
    action: "storeTrue"
});
parser.addArgument( '--storeMmtf', {
    help: 'store as binary "$structureId.mmtf"',
    action: "storeTrue"
});
parser.addArgument( '--storeJson', {
    help: 'store as decoded "$structureId.json"',
    action: "storeTrue"
});
parser.addArgument( '--storeJsonEncoded', {
    help: 'store as encoded "$structureId.encoded.json"',
    action: "storeTrue"
});
parser.addArgument( '--summaryPath', {
    help: 'path and name for the summary file (default: summary.txt)',
    defaultValue: 'summary.txt'
});
parser.addArgument( '--errorPath', {
    help: 'path and name for the error file (default: error.txt)',
    defaultValue: 'error.txt'
});
parser.addArgument( '--reportPath', {
    help: 'path and name for the report file (default: report.csv)',
    defaultValue: 'report.csv'
});
var args = parser.parseArgs();

//

function printSummary (summary) {
    if(args.printSummary) console.log(summary);
}

if (args.file!==null) {
    getFileListSummary(args.file, args).then(printSummary);
}

if (args.url!==null) {
    getUrlListSummary(args.url, args).then(printSummary);
}

if (args.pdbid!==null) {
    getPdbidListSummary(args.pdbid, args).then(printSummary);
}

if (args.archive!==null) {
    loadPdbidList().then(function(_pdbidList){
        var pdbidList = getRandomPdbidList(args.archive, _pdbidList);
        return getPdbidListSummary(pdbidList, args).then(printSummary);
    });
}
