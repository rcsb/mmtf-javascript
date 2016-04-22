
var _decodeMsgpack = require("../../dist/msgpack-decode");
var _decodeMmtf = require("../../dist/mmtf-decode");

//

var FULL_URL = "http://mmtf.rcsb.org/full/";

function decodeMsgpack (data) {
    return new Promise(function (resolve, reject) {
        try{
            resolve(_decodeMsgpack(data));
        }catch(err){
            reject("msgpack decoding error: '" + err + "'");
        }
    });
}

function decodeMmtf (data) {
    return new Promise(function (resolve, reject) {
        try{
            resolve(_decodeMmtf(data));
        }catch(err){
            reject("mmtf decoding error: '" + err + "'");
        }
    });
}

//

exports.FULL_URL = FULL_URL;
exports.decodeMsgpack = decodeMsgpack;
exports.decodeMmtf = decodeMmtf;
