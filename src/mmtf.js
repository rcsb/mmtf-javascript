/**
 * @file mmtf
 * @private
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

/**
 * MMTF module.
 * @module MMTF
 */

import decodeMsgpack from "./msgpack-decode.js";
import decodeMmtf from "./mmtf-decode.js";
import traverseMmtf from "./mmtf-traverse.js";

/**
 * Version name
 * @static
 * @type {String}
 */
var version = "v0.2.2";

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

export {
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
     * @param {module:MmtfTraverse.onModel} eventCallbacks.onModel - called for each model
     * @param {module:MmtfTraverse.onChain} eventCallbacks.onChain - called for each chain
     * @param {module:MmtfTraverse.onGroup} eventCallbacks.onGroup - called for each group
     * @param {module:MmtfTraverse.onAtom} eventCallbacks.onAtom - called for each atom
     * @param {module:MmtfTraverse.onBond} eventCallbacks.onBond - called for each bond
     */
    traverseMmtf as traverse,
    version
};
