/**
 * @file mmtf-decode
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import decodeMsgpack from "./msgpack-decode.js";

import {
    getUint8View, getInt8View, getInt16, getInt32, getInt32View,
    decodeRunLength, decodeDelta, decodeSplitListDelta,
    decodeFloatSplitListDelta, decodeFloatRunLength
} from "./mmtf-decode-helpers.js";

/**
 * Decode MMTF fields
 * @param  {Uint8Array|ArrayBuffer|Object} binOrDict - binary MessagePack or encoded MMTF data
 * @param  {Object} [params] - decoding parameters
 *  - @param {Boolean} params.littleEndian - decoded field's byte order is little endian
 *  - @param {Array} params.ignoreFields - names of optional fields not to decode
 * @return {Object} mmtfData
 */
function decodeMmtf( binOrDict, params ){

    params = params || {};

    var littleEndian = params.littleEndian;
    var ignoreFields = params.ignoreFields;

    // helper functions to tell if a field should be decoded
    function decodeField( name ){
        return ignoreFields ? ignoreFields.indexOf( name ) === -1 : true;
    }

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

    // hoisted loop variables
    var i, il;

    // get counts
    var numBonds = inputDict.numBonds || 0;
    var numAtoms = inputDict.numAtoms || 0;
    var numGroups = inputDict.groupTypeList.length / 4;
    var numChains = inputDict.chainIdList.length / 4;
    var numModels = inputDict.chainsPerModel.length;

    // initialize output dict
    var outputDict = {
        numGroups: numGroups,
        numChains: numChains,
        numModels: numModels
    };

    // copy some fields over from the input dict
    [
        "mmtfVersion", "mmtfProducer",
        "unitCell", "spaceGroup", "structureId", "title", "depositionDate",
        "experimentalMethods", "resolution", "rFree", "rWork",
        "bioAssemblyList", "entityList", "groupList",
        "numBonds", "numAtoms",
        "groupsPerChain", "chainsPerModel"
    ].forEach( function( name ){
        if( inputDict[ name ] !== undefined ){
            outputDict[ name ] = inputDict[ name ];
        }
    } );

    //////////////
    // bond data

    // decode inter group bond atom indices, i.e. get int32 array
    var inputBondAtomList = inputDict.bondAtomList;
    if( inputBondAtomList && decodeField( "bondAtomList" ) ){
        outputDict.bondAtomList = getInt32( inputBondAtomList, undefined, littleEndian );
    }

    // decode inter group bond orders, i.e. get uint8 array
    var inputBondOrderList = inputDict.bondOrderList;
    if( inputBondOrderList && decodeField( "bondOrderList" ) ){
        outputDict.bondOrderList = getUint8View( inputBondOrderList );
    }

    //////////////
    // atom data

    // split-list delta & integer decode x, y, z atom coords
    outputDict.xCoordList = decodeFloatSplitListDelta(
        inputDict.xCoordBig, inputDict.xCoordSmall, 1000, undefined, littleEndian
    );
    outputDict.yCoordList = decodeFloatSplitListDelta(
        inputDict.yCoordBig, inputDict.yCoordSmall, 1000, undefined, littleEndian
    );
    outputDict.zCoordList = decodeFloatSplitListDelta(
        inputDict.zCoordBig, inputDict.zCoordSmall, 1000, undefined, littleEndian
    );

    // split-list delta & integer decode b-factors
    var inputBfactorBig = inputDict.bFactorBig;
    var inputBfactorSmall = inputDict.bFactorSmall;
    if( inputBfactorBig && inputBfactorSmall && decodeField( "bFactorList" ) ){
        outputDict.bFactorList = decodeFloatSplitListDelta(
            inputBfactorBig, inputBfactorSmall, 100, undefined, littleEndian
        );
    }

    // delta & run-length decode atom ids
    var inputAtomIdList = inputDict.atomIdList;
    if( inputAtomIdList && decodeField( "atomIdList" ) ){
        outputDict.atomIdList = decodeDelta(
            decodeRunLength( getInt32( inputAtomIdList, undefined, littleEndian ) )
        );
    }

    // run-length decode alternate labels
    var inputAltLocList = inputDict.altLocList;
    if( inputAltLocList && decodeField( "altLocList" ) ){
        outputDict.altLocList = decodeRunLength( inputAltLocList, new Uint8Array( numAtoms ) );
    }

    // run-length & integer decode occupancies
    var inputOccupancyList = inputDict.occupancyList;
    if( inputOccupancyList && decodeField( "occupancyList" ) ){
        outputDict.occupancyList = decodeFloatRunLength(
            inputOccupancyList, 100, undefined, littleEndian
        );
    }

    ///////////////
    // group data

    // run-length & delta decode group numbers
    outputDict.groupIdList = decodeDelta(
        decodeRunLength( getInt32( inputDict.groupIdList, undefined, littleEndian ) )
    );

    // decode group types, i.e. get int32 array
    outputDict.groupTypeList = getInt32( inputDict.groupTypeList, undefined, littleEndian );

    // decode secondary structure, i.e. get int8 view
    var inputSecStructList = inputDict.secStructList;
    if( inputSecStructList && decodeField( "secStructList" ) ){
        outputDict.secStructList = getInt8View( inputSecStructList );
    }

    // run-length decode insertion codes
    var inputInsCodeList = inputDict.insCodeList;
    if( inputInsCodeList && decodeField( "insCodeList" ) ){
        outputDict.insCodeList = decodeRunLength( inputInsCodeList, new Uint8Array( numGroups ) );
    }

    // run-length & delta decode sequence ids
    var inputSequenceIdList = inputDict.sequenceIdList;
    if( inputSequenceIdList && decodeField( "sequenceIdList" ) ){
        outputDict.sequenceIdList = decodeDelta(
            decodeRunLength( getInt32( inputSequenceIdList, undefined, littleEndian ) )
        );
    }

    ///////////////
    // chain data

    // decode chain ids, i.e. get int8 view
    outputDict.chainIdList = getUint8View( inputDict.chainIdList );

    // decode chain names, i.e. get int8 view
    var inputChainNameList = inputDict.chainNameList;
    if( inputChainNameList && decodeField( "chainNameList" ) ){
        outputDict.chainNameList = getUint8View( inputChainNameList );
    }

    return outputDict;

}

export default decodeMmtf;
