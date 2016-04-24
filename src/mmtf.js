/**
 * @file mmtf
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import decodeMsgpack from "./msgpack-decode.js";
import decodeMmtf from "./mmtf-decode.js";
import traverseMmtf from "./mmtf-traverse.js";

/**
 * Decode MMTF fields
 * @param  {Uint8Array|ArrayBuffer|Object} binOrDict - binary MessagePack or encoded MMTF data
 * @param  {Object} [params] - decoding parameters
 *  - @param {Array} params.ignoreFields - names of optional fields not to decode
 * @return {Object} mmtfData
 */
function decode( binOrDict, params ){
	// make sure binOrDict is not a plain Arraybuffer
    if( binOrDict instanceof ArrayBuffer ){
        binOrDict = new Uint8Array( binOrDict );
    }

    var inputDict;
    if( binOrDict instanceof Uint8Array ){
        // get dict from msgpack
        inputDict = decodeMsgpack( binOrDict );
    }else{
        // already a dict
        inputDict = binOrDict;
    }

    return decodeMmtf( inputDict, params );
}

var traverse = traverseMmtf;

export {
    decode, traverse
};
