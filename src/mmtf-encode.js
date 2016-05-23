/**
 * @file mmtf-encode
 * @private
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

/**
 * mmtf encode module.
 * @module MmtfEncode
 */

import { PassThroughFields } from "./mmtf-constants.js";
import {
    getUint8View, getInt8View, getInt32, makeInt32Buffer,
    encodeRunLength, encodeDelta, encodeFloatToInteger,
    encodeFloatSplitListDelta, encodeFloatRunLength
} from "./mmtf-utils.js";


function encodeMmtf( inputDict ){

    var outputDict = {

    };

    // copy some fields over from the input dict
    PassThroughFields.forEach( function( name ){
        if( inputDict[ name ] !== undefined ){
            outputDict[ name ] = inputDict[ name ];
        }
    } );

    //////////////
    // bond data

    // encode inter group bond atom indices, i.e. get bytes in big endian order
    if( inputDict.bondAtomList ){
        outputDict.bondAtomList = new Uint8Array( makeInt32Buffer( inputDict.bondAtomList ) );
    }

    // encode inter group bond orders, i.e. get bytes
    if( inputDict.bondOrderList ){
        outputDict.bondOrderList = new Uint8Array( inputDict.bondOrderList.buffer );
    }

    //////////////
    // atom data

    // split-list delta & integer encode x, y, z atom coords
    var xCoordList = encodeFloatSplitListDelta( inputDict.xCoordList, 1000 );
    outputDict.xCoordBig = new Uint8Array( xCoordList[ 0 ] );
    outputDict.xCoordSmall = new Uint8Array( xCoordList[ 1 ] );

    var yCoordList = encodeFloatSplitListDelta( inputDict.yCoordList, 1000 );
    outputDict.yCoordBig = new Uint8Array( yCoordList[ 0 ] );
    outputDict.yCoordSmall = new Uint8Array( yCoordList[ 1 ] );

    var zCoordList = encodeFloatSplitListDelta( inputDict.zCoordList, 1000 );
    outputDict.zCoordBig = new Uint8Array( zCoordList[ 0 ] );
    outputDict.zCoordSmall = new Uint8Array( zCoordList[ 1 ] );

    // split-list delta & integer encode b-factors
    if( inputDict.bFactorList ){
        var bFactorList = encodeFloatSplitListDelta( inputDict.bFactorList, 100 );
        outputDict.bFactorBig = new Uint8Array( bFactorList[ 0 ] );
        outputDict.bFactorSmall = new Uint8Array( bFactorList[ 1 ] );
    }

    // delta & run-length encode atom ids
    if( inputDict.atomIdList ){
        outputDict.atomIdList = new Uint8Array(
            encodeRunLength( encodeDelta( inputDict.atomIdList ) )
        );
    }

    // run-length encode alternate labels
    if( inputDict.altLocList ){
        outputDict.altLocList = new Uint8Array(
            encodeRunLength( inputDict.altLocList )
        );
    }

    // run-length & integer encode occupancies
    if( inputDict.occupancyList ){
        outputDict.occupancyList = new Uint8Array( encodeRunLength(
            new Int32Array( encodeFloatToInteger( inputDict.occupancyList, 100, 4, true ) )
        ) );
    }

    ///////////////
    // group data

    // run-length & delta encode group numbers
    outputDict.groupIdList = new Uint8Array(
        encodeRunLength( encodeDelta( inputDict.groupIdList ) )
    );

    // encode group types, i.e. get int32 array
    outputDict.groupTypeList = new Uint8Array(
        makeInt32Buffer( inputDict.groupTypeList )
    );

    // encode secondary structure, i.e. get bytes
    if( inputDict.secStructList ){
        outputDict.secStructList = new Uint8Array( inputDict.secStructList.buffer );
    }

    // run-length encode insertion codes
    if( inputDict.insCodeList ){
        outputDict.insCodeList = new Uint8Array(
            encodeRunLength( inputDict.insCodeList )
        );
    }

    // run-length & delta encode sequence indices
    if( inputDict.sequenceIndexList ){
        outputDict.sequenceIndexList = new Uint8Array(
            encodeRunLength( encodeDelta( inputDict.sequenceIndexList ) )
        );
    }

    ///////////////
    // chain data

    // encode chain ids, i.e. get bytes
    outputDict.chainIdList = new Uint8Array( inputDict.chainIdList.buffer );

    // encode chain names, i.e. get bytes
    if( inputDict.chainNameList ){
        outputDict.chainNameList = new Uint8Array( inputDict.chainNameList.buffer );
    }

    return outputDict;

}


export default encodeMmtf;
