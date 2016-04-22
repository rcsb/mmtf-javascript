
var fs = require('fs');
var request = require('request');
var zlib = require('zlib');
var Promise = require('promise');

var mmtf = require('./mmtf');

//

function jsonFormatMmtf( key, value ){
    if( value instanceof Int8Array || value instanceof Uint8Array ||
        value instanceof Int16Array || value instanceof Uint16Array ||
        value instanceof Int32Array || value instanceof Uint32Array ||
        value instanceof Float32Array || value instanceof Float64Array
    ){
        return Array.prototype.slice.call( value );
    }
    return value;
}

function jsonFormatMsgpack( key, value ){
    if( value instanceof Uint8Array ){
        var buffer = new Buffer(value);
        value = buffer.toString('base64');
    }
    return value;
}

function readFile (file) {
    return new Promise(function (resolve, reject) {
        fs.readFile( file, function(err, data){
            if (err) {
                reject("error reading: '" + err + "'");
            }else{
                resolve(data);
            }
        });
    });
}

function readJson (file) {
    return readFile(file).then(function(data){
        return JSON.parse(data);
    });
}

function loadUrl (url, params) {
    var p = Object.assign({}, params);
    var pool = p.pool;
    var timeout = p.timeout===undefined ? 5000 : p.timeout;
    return new Promise(function (resolve, reject) {
        var options = {
            url: url,
            pool: pool,
            timeout: timeout
        }
        var req = request.get(options);

        req.on('error', function(err) {
            reject("error requesting '" + err + "'");
        });

        req.on('response', function(response) {
            if(response.statusCode!==200){
                reject("error response 'status code " + response.statusCode + "'");
            }else{
                var chunks = [];
                response.on('data', function(chunk) {
                    chunks.push(chunk);
                });
                response.on('end', function() {
                    var buffer = Buffer.concat(chunks);
                    zlib.gunzip(buffer, function(err, decoded) {
                        if (err) {
                            reject("error unzipping '" + err + "'");
                        }else{
                            var data = new Uint8Array(decoded);
                            if(data.length===0){
                                reject("error data 'zero bytes'");
                            }else{
                                resolve(data);
                            }
                        }
                    });
                });
            }
        });
    });
}

function loadPdbid (pdbid, params) {
    var url = mmtf.FULL_URL + pdbid;
    return loadUrl(url, params);
}

function writeBinary (name, data) {
    var mmtfFile = fs.createWriteStream(name);
    mmtfFile.write(new Buffer(data));
    mmtfFile.end();
}

function writeMmtfJson( name, decodedMmtf ){
    var jsonFile = fs.createWriteStream(name);
    jsonFile.write(JSON.stringify(decodedMmtf, jsonFormatMmtf, '\t'));
    jsonFile.end();
}

function writeEncodedMmtfJson( name, decodedMsgpack ){
    var encodedJsonFile = fs.createWriteStream(name);
    encodedJsonFile.write(JSON.stringify(decodedMsgpack, jsonFormatMsgpack, '\t'));
    encodedJsonFile.end();
}

//

exports.readFile = readFile;
exports.loadUrl = loadUrl;
exports.writeMmtfJson = writeMmtfJson;
exports.writeEncodedMmtfJson = writeEncodedMmtfJson;
