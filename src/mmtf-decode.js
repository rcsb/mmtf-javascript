/**
 * @file msgpack-decode
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import decodeMsgpack from "./msgpack-decode.js";

import {
    getUint8View, getInt8View, getInt16, getInt32, getInt32View,
    decodeFloat, decodeRunLength, decodeDelta, decodeSplitListDelta,
    decodeFloatSplitList, decodeFloatRunLength
} from "./mmtf-decode-helpers.js";

function decodeMmtf( binOrDict, params ){

    params = params || {};

    var littleEndian = params.littleEndian;
    var ignoreFields = params.ignoreFields;

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

    // counts
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
        "unitCell", "spaceGroup", "pdbId", "title",
        "experimentalMethods", "resolution", "rFree", "rWork",
        "bioAssemblyList", "entityList", "groupMap",
        "numBonds", "numAtoms",
        "groupsPerChain", "chainsPerModel"
    ].forEach( function( name ){
        if( inputDict[ name ] !== undefined ){
            outputDict[ name ] = inputDict[ name ];
        }
    } );

    //////////////
    // bond data

    var inputBondAtomList = inputDict.bondAtomList;
    if( inputBondAtomList && decodeField( "bondAtomList" ) ){
        outputDict.bondAtomList = getInt32( inputBondAtomList, undefined, littleEndian );
    }

    var inputBondOrderList = inputDict.bondOrderList;
    if( inputBondOrderList && decodeField( "bondOrderList" ) ){
        outputDict.bondOrderList = getUint8View( inputBondOrderList );
    }

    //////////////
    // atom data

    // split-list delta & integer decode x, y, z atom coords
    outputDict.xCoordList = decodeFloatSplitList(
        inputDict.xCoordBig, inputDict.xCoordSmall, 1000, undefined, littleEndian
    );
    outputDict.yCoordList = decodeFloatSplitList(
        inputDict.yCoordBig, inputDict.yCoordSmall, 1000, undefined, littleEndian
    );
    outputDict.zCoordList = decodeFloatSplitList(
        inputDict.zCoordBig, inputDict.zCoordSmall, 1000, undefined, littleEndian
    );

    // split-list delta & integer decode b-factors
    var inputBfactorBig = inputDict.bFactorBig;
    var inputBfactorSmall = inputDict.bFactorSmall;
    if( inputBfactorBig && inputBfactorSmall && decodeField( "bFactorList" ) ){
        outputDict.bFactorList = decodeFloatSplitList(
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
    var inputAltLabelList = inputDict.altLabelList;
    if( inputAltLabelList && decodeField( "altLabelList" ) ){
        for( i = 0, il = inputAltLabelList.length; i < il; i+=2 ){
            var inputAltLabel = inputAltLabelList[ i ];
            inputAltLabelList[ i ] = inputAltLabel === "?" ? 0 : inputAltLabel.charCodeAt( 0 );
            inputAltLabelList[ i + 1 ] = parseInt( inputAltLabelList[ i + 1 ] );
        }
        outputDict.altLabelList = decodeRunLength( inputAltLabelList, new Uint8Array( numAtoms ) );
    }

    // run-length & integer decode occupancies
    var inputOccList = inputDict.occList;
    if( inputOccList && decodeField( "occList" ) ){
        outputDict.occList = decodeFloatRunLength(
            inputOccList, 100, undefined, littleEndian
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
        for( i = 0, il = inputInsCodeList.length; i < il; i+=2 ){
            var inputInsCode = inputInsCodeList[ i ];
            inputInsCodeList[ i ] = inputInsCode === null ? 0 : inputInsCode.charCodeAt( 0 );
            inputInsCodeList[ i + 1 ] = parseInt( inputInsCodeList[ i + 1 ] );
        }
        outputDict.insCodeList = decodeRunLength( inputInsCodeList, new Uint8Array( numGroups ) );
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
