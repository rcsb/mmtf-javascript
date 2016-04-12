/**
 * @file mmtf-decode
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import decodeMsgpack from "./msgpack-decode.js";

import {
    getUint8View, getInt8View, getInt32,
    decodeRunLength, decodeDelta,
    decodeFloatSplitListDelta, decodeFloatRunLength
} from "./mmtf-decode-helpers.js";

/**
 * Decode MMTF fields
 * @param  {Uint8Array|ArrayBuffer|Object} binOrDict - binary MessagePack or encoded MMTF data
 * @param  {Object} [params] - decoding parameters
 *  - @param {Array} params.ignoreFields - names of optional fields not to decode
 * @return {Object} mmtfData
 */
function decodeMmtf( binOrDict, params ){

    params = params || {};

    var ignoreFields = params.ignoreFields;

    // helper function to tell if a field should be decoded
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
        "unitCell", "spaceGroup", "structureId", "title",
        "depositionDate", "releaseDate",
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
    var bondAtomListKey = "bondAtomList";
    if( inputDict[ bondAtomListKey ] && decodeField( bondAtomListKey ) ){
        outputDict[ bondAtomListKey ] = getInt32( inputDict[ bondAtomListKey ] );
    }

    // decode inter group bond orders, i.e. get uint8 array
    var bondOrderListKey = "bondOrderList";
    if( inputDict[ bondOrderListKey ] && decodeField( bondOrderListKey ) ){
        outputDict[ bondOrderListKey ] = getUint8View( inputDict[ bondOrderListKey ] );
    }

    //////////////
    // atom data

    // split-list delta & integer decode x, y, z atom coords
    outputDict.xCoordList = decodeFloatSplitListDelta(
        inputDict.xCoordBig, inputDict.xCoordSmall, 1000
    );
    outputDict.yCoordList = decodeFloatSplitListDelta(
        inputDict.yCoordBig, inputDict.yCoordSmall, 1000
    );
    outputDict.zCoordList = decodeFloatSplitListDelta(
        inputDict.zCoordBig, inputDict.zCoordSmall, 1000
    );

    // split-list delta & integer decode b-factors
    var bFactorListKey = "bFactorList";
    var bFactorBigKey = "bFactorBig";
    var bFactorSmallKey = "bFactorSmall";
    if( inputDict[ bFactorBigKey ] && inputDict[ bFactorSmallKey ] && decodeField( bFactorListKey ) ){
        outputDict[ bFactorListKey ] = decodeFloatSplitListDelta(
            inputDict[ bFactorBigKey ], inputDict[ bFactorSmallKey ], 100
        );
    }

    // delta & run-length decode atom ids
    var atomIdListKey = "atomIdList";
    if( inputDict[ atomIdListKey ] && decodeField( atomIdListKey ) ){
        outputDict[ atomIdListKey ] = decodeDelta(
            decodeRunLength( getInt32( inputDict[ atomIdListKey ] ) )
        );
    }

    // run-length decode alternate labels
    var altLocListKey = "altLocList";
    if( inputDict[ altLocListKey ] && decodeField( altLocListKey ) ){
        outputDict[ altLocListKey ] = decodeRunLength(
            inputDict[ altLocListKey ], new Uint8Array( numAtoms )
        );
    }

    // run-length & integer decode occupancies
    var occupancyListKey = "occupancyList";
    if( inputDict[ occupancyListKey ] && decodeField( occupancyListKey ) ){
        outputDict[ occupancyListKey ] = decodeFloatRunLength( inputDict[ occupancyListKey ], 100 );
    }

    ///////////////
    // group data

    // run-length & delta decode group numbers
    outputDict.groupIdList = decodeDelta(
        decodeRunLength( getInt32( inputDict.groupIdList ) )
    );

    // decode group types, i.e. get int32 array
    outputDict.groupTypeList = getInt32( inputDict.groupTypeList );

    // decode secondary structure, i.e. get int8 view
    var secStructListKey = "secStructList";
    if( inputDict[ secStructListKey ] && decodeField( secStructListKey ) ){
        outputDict[ secStructListKey ] = getInt8View( inputDict[ secStructListKey ] );
    }

    // run-length decode insertion codes
    var insCodeListKey = "insCodeList";
    if( inputDict[ insCodeListKey ] && decodeField( insCodeListKey ) ){
        outputDict[ insCodeListKey ] = decodeRunLength(
            inputDict[ insCodeListKey ], new Uint8Array( numGroups )
        );
    }

    // run-length & delta decode sequence indices
    var sequenceIndexListKey = "sequenceIndexList";
    if( inputDict[ sequenceIndexListKey ] && decodeField( sequenceIndexListKey ) ){
        outputDict[ sequenceIndexListKey ] = decodeDelta(
            decodeRunLength( getInt32( inputDict[ sequenceIndexListKey ] ) )
        );
    }

    ///////////////
    // chain data

    // decode chain ids, i.e. get int8 view
    outputDict.chainIdList = getUint8View( inputDict.chainIdList );

    // decode chain names, i.e. get int8 view
    var chainNameListKey = "chainNameList";
    if( inputDict[ chainNameListKey ] && decodeField( chainNameListKey ) ){
        outputDict[ chainNameListKey ] = getUint8View( inputDict[ chainNameListKey ] );
    }

    return outputDict;

}

export default decodeMmtf;
