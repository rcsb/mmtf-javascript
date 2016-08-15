/**
 * @file mmtf
 * @private
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

/**
 * MMTF module.
 * @module MMTF
 */

import encodeMsgpack from "./msgpack-encode.js";
import encodeMmtf from "./mmtf-encode.js";
import decodeMsgpack from "./msgpack-decode.js";
import decodeMmtf from "./mmtf-decode.js";
import traverseMmtf from "./mmtf-traverse.js";

/**
 * Version name
 * @static
 * @type {String}
 */
var version = "v1.0.0";

/**
 * Version name
 * @private
 * @type {String}
 */
var baseUrl = "http://mmtf.rcsb.org/v1.0/";

/**
 * URL of the RCSB webservice to obtain MMTF files
 * @static
 * @type {String}
 */
var fetchUrl = baseUrl + "full/";

/**
 * URL of the RCSB webservice to obtain reduced MMTF files
 * @static
 * @type {String}
 */
var fetchReducedUrl = baseUrl + "reduced/";

/**
 * Encode MMTF fields
 * @static
 * @param  {module:MmtfDecode.MmtfData} mmtfData - mmtf data
 * @return {Uint8Array} encoded MMTF fields
 */
function encode( mmtfData ){
    return encodeMsgpack( encodeMmtf( mmtfData ) );
}

/**
 * Decode MMTF fields
 * @static
 * @example
 * // bin is Uint8Array containing the mmtf msgpack
 * var mmtfData = MMTF.decode( bin );
 * console.log( mmtfData.numAtoms );
 *
 * @param  {Uint8Array|ArrayBuffer|module:MmtfDecode.EncodedMmtfData} binOrDict - binary MessagePack or encoded MMTF data
 * @param  {Object} [params] - decoding parameters
 * @param {String[]} params.ignoreFields - names of optional fields not to decode
 * @return {module:MmtfDecode.MmtfData} mmtfData
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

/**
 * @callback module:MMTF.onLoad
 * @param {module:MmtfDecode.MmtfData} mmtfData - decoded mmtf data object
 */

/**
 * helper method to fetch binary files from an URL
 * @private
 * @param  {String} pdbid - PDB ID to fetch
 * @param  {String} baseUrl - URL to fetch from
 * @param  {module:MMTF.onLoad} onLoad - callback( mmtfData )
 * @param  {Function} onError - callback( error )
 * @return {undefined}
 */
function _fetch( pdbid, baseUrl, onLoad, onError ){
    var xhr = new XMLHttpRequest();
    function _onLoad(){
        try{
            var mmtfData = decode( xhr.response );
            onLoad( mmtfData );
        }catch( error ){
            onError( error );
        }
    }
    xhr.addEventListener( "load", _onLoad, true );
    xhr.addEventListener( "error", onError, true );
    xhr.responseType = "arraybuffer";
    xhr.open( "GET", baseUrl + pdbid.toUpperCase() );
    xhr.send();
}

/**
 * Fetch MMTF file from RCSB webservice which contains
 * @static
 * @example
 * MMTF.fetch(
 *     "3PQR",
 *     // onLoad callback
 *     function( mmtfData ){ console.log( mmtfData ) },
 *     // onError callback
 *     function( error ){ console.error( error ) }
 * );
 *
 * @param  {String} pdbid - PDB ID to fetch
 * @param  {module:MMTF.onLoad} onLoad - callback( mmtfData )
 * @param  {Function} onError - callback( error )
 * @return {undefined}
 */
function fetch( pdbid, onLoad, onError ){
    _fetch( pdbid, fetchUrl, onLoad, onError );
}

/**
 * Fetch reduced MMTF file from RCSB webservice which contains
 * protein C-alpha, nucleotide phosphate and ligand atoms
 * @static
 * @example
 * MMTF.fetchReduced(
 *     "3PQR",
 *     // onLoad callback
 *     function( mmtfData ){ console.log( mmtfData ) },
 *     // onError callback
 *     function( error ){ console.error( error ) }
 * );
 *
 * @param  {String} pdbid - PDB ID to fetch
 * @param  {module:MMTF.onLoad} onLoad - callback( mmtfData )
 * @param  {Function} onError - callback( error )
 * @return {undefined}
 */
function fetchReduced( pdbid, onLoad, onError ){
    _fetch( pdbid, fetchReducedUrl, onLoad, onError );
}


export {
    encode,
    decode,
    /**
     * Traverse the MMTF structure data.
     * @function
     * @example
     * // `bin` is an Uint8Array containing the MMTF MessagePack
     * var mmtfData = MMTF.decode( bin );
     *
     * // create event callback functions
     * var eventCallbacks = {
     *     onModel: function( modelData ){ console.log( modelData ) },
     *     onChain: function( chainData ){ console.log( chainData ) },
     *     onGroup: function( groupData ){ console.log( groupData ) },
     *     onAtom: function( atomData ){ console.log( atomData ) },
     *     onBond: function( bondData ){ console.log( bondData ) }
     * };
     *
     * // traverse the structure and lsiten to the events
     * MMTF.traverse( mmtfData, eventCallbacks );
     *
     * @param {module:MmtfDecode.MmtfData} mmtfData - decoded mmtf data
     * @param {Object} eventCallbacks
     * @param {module:MmtfTraverse.onModel} [eventCallbacks.onModel] - called for each model
     * @param {module:MmtfTraverse.onChain} [eventCallbacks.onChain] - called for each chain
     * @param {module:MmtfTraverse.onGroup} [eventCallbacks.onGroup] - called for each group
     * @param {module:MmtfTraverse.onAtom} [eventCallbacks.onAtom] - called for each atom
     * @param {module:MmtfTraverse.onBond} [eventCallbacks.onBond] - called for each bond
     * @param {Object} [params] - traversal parameters
     * @param {Boolean} [params.firstModelOnly] - traverse only the first model
     */
    traverseMmtf as traverse,
    fetch,
    fetchReduced,

    version,
    fetchUrl,
    fetchReducedUrl,

    encodeMsgpack,
    encodeMmtf,
    decodeMsgpack,
    decodeMmtf
};
