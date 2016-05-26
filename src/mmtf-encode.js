/**
 * @file mmtf-encode
 * @private
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

/**
 * mmtf encode module.
 * @module MmtfEncode
 */

import { FieldNames } from "./mmtf-constants.js";
import {
    getUint8View,
    encodeInt16, encodeInt32, encodeFloat32,
    encodeRun, encodeDelta, encodeInteger, encodePacking,
    encodeIntegerDelta, encodeIntegerRun, encodeIntegerPacking, encodeIntegerDeltaPacking,
    encodeBytes
} from "./mmtf-utils.js";


/**
 * [encodingStrategies description]
 * @type {Object}
 */
var encodingStrategies = {

    1: function( float32 ){
        var size = float32.length;
        var bytes = encodeFloat32( float32 );
        return encodeBytes( 1, size, undefined, bytes );
    },
    2: function( int8 ){
        var size = int8.length;
        var bytes = getUint8View( int8 );
        return encodeBytes( 2, size, undefined, bytes );
    },
    3: function( int16 ){
        var size = int16.length;
        var bytes = encodeInt16( int16 );
        return encodeBytes( 3, size, undefined, bytes );
    },
    4: function( int32 ){
        var size = int32.length;
        var bytes = encodeInt32( int32 );
        return encodeBytes( 4, size, undefined, bytes );
    },
    5: function( stringBytes, length ){
        var size = stringBytes.length / length;
        var param = encodeInt32([ length ]);
        var bytes = getUint8View( stringBytes );
        return encodeBytes( 5, size, param, bytes );
    },
    6: function( charBytes ){
        var size = charBytes.length;
        var bytes = encodeRun( charBytes );
        return encodeBytes( 6, size, undefined, bytes );
    },
    7: function( int32 ){
        var size = int32.length;
        var bytes = encodeInt32( encodeRun( int32 ) );
        return encodeBytes( 7, size, undefined, bytes );
    },
    8: function( int32 ){
        var size = int32.length;
        var bytes = encodeInt32( encodeDeltaRun( int32 ) );
        return encodeBytes( 8, size, undefined, bytes );
    },
    9: function( float32, factor ){
        var size = float32.length;
        var param = encodeInt32([ factor ]);
        var bytes = encodeInt32( encodeIntegerRun( float32, factor ) );
        return encodeBytes( 9, size, param, bytes );
    },
    10: function( float32, factor ){
        var size = float32.length;
        var param = encodeInt32([ factor ]);
        var bytes = encodeInt16( encodeIntegerDeltaPacking( float32, factor ) );
        return encodeBytes( 10, size, param, bytes );
    },
    11: function( float32, factor ){
        var size = float32.length;
        var param = encodeInt32([ factor ]);
        var bytes = encodeInt16( encodeInteger( float32, factor, new Int16Array( size ) ) );
        return encodeBytes( 11, size, param, bytes );
    },
    12: function( float32, factor ){
        var size = float32.length;
        var param = encodeInt32([ factor ]);
        var bytes = encodeInt16( encodeIntegerPacking( float32, factor ) );
        return encodeBytes( 12, size, param, bytes );
    },
    13: function( float32, factor ){
        var size = float32.length;
        var param = encodeInt32([ factor ]);
        var bytes = getUint8View( encodeIntegerPacking( float32, factor, true ) );
        return encodeBytes( 13, size, param, bytes );
    }

};


function encodeMmtf( inputDict ){

    var outputDict = {

    };

    // copy some fields over from the input dict
    FieldNames.forEach( function( name ){
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
