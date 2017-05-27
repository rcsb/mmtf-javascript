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
    getUint8View,
    encodeInt16, encodeInt32, encodeFloat32,
    encodeRun, encodeDelta, encodeInteger, encodePacking,
    encodeDeltaRun, encodeIntegerDelta, encodeIntegerRun, encodeIntegerPacking, encodeIntegerDeltaPacking,
    encodeBytes
} from "./mmtf-utils.js";


function passFloat32( float32 ){
    var size = float32.length;
    var bytes = encodeFloat32( float32 );
    return encodeBytes( 1, size, undefined, bytes );
}

function passInt8( int8 ){
    var size = int8.length;
    var bytes = getUint8View( int8 );
    return encodeBytes( 2, size, undefined, bytes );
}

function passInt16( int16 ){
    var size = int16.length;
    var bytes = encodeInt16( int16 );
    return encodeBytes( 3, size, undefined, bytes );
}

function passInt32( int32 ){
    var size = int32.length;
    var bytes = encodeInt32( int32 );
    return encodeBytes( 4, size, undefined, bytes );
}

function passString( stringBytes, length ){
    var size = stringBytes.length / length;
    var param = encodeInt32([ length ]);
    var bytes = getUint8View( stringBytes );
    return encodeBytes( 5, size, param, bytes );
}

function runChar( charBytes ){
    var size = charBytes.length;
    var bytes = encodeInt32( encodeRun( charBytes ) );
    return encodeBytes( 6, size, undefined, bytes );
}

function run( int32 ){
    var size = int32.length;
    var bytes = encodeInt32( encodeRun( int32 ) );
    return encodeBytes( 7, size, undefined, bytes );
}

function deltaRun( int32 ){
    var size = int32.length;
    var bytes = encodeInt32( encodeDeltaRun( int32 ) );
    return encodeBytes( 8, size, undefined, bytes );
}

function integerRun( float32, factor ){
    var size = float32.length;
    var param = encodeInt32([ factor ]);
    var bytes = encodeInt32( encodeIntegerRun( float32, factor ) );
    return encodeBytes( 9, size, param, bytes );
}

function integerDeltaPacking16( float32, factor ){
    var size = float32.length;
    var param = encodeInt32([ factor ]);
    var bytes = encodeInt16( encodeIntegerDeltaPacking( float32, factor ) );
    return encodeBytes( 10, size, param, bytes );
}

function integer16( float32, factor ){
    var size = float32.length;
    var param = encodeInt32([ factor ]);
    var bytes = encodeInt16( encodeInteger( float32, factor, new Int16Array( size ) ) );
    return encodeBytes( 11, size, param, bytes );
}

function integerPacking16( float32, factor ){
    var size = float32.length;
    var param = encodeInt32([ factor ]);
    var bytes = encodeInt16( encodeIntegerPacking( float32, factor ) );
    return encodeBytes( 12, size, param, bytes );
}

function integerPacking8( float32, factor ){
    var size = float32.length;
    var param = encodeInt32([ factor ]);
    var bytes = getUint8View( encodeIntegerPacking( float32, factor, true ) );
    return encodeBytes( 13, size, param, bytes );
}

function packing16( int32, factor ){
    var size = int32.length;
    var bytes = encodeInt16( encodePacking( int32 ) );
    return encodeBytes( 14, size, undefined, bytes );
}

function packing8( int32, factor ){
    var size = int32.length;
    var bytes = getUint8View( encodePacking( int32, true ) );
    return encodeBytes( 15, size, undefined, bytes );
}


function encodeMmtf( inputDict ){

    var outputDict = {};

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
        outputDict.bondAtomList = passInt32( inputDict.bondAtomList );
    }

    // encode inter group bond orders, i.e. get bytes
    if( inputDict.bondOrderList ){
        outputDict.bondOrderList = passInt8( inputDict.bondOrderList );
    }

    //////////////
    // atom data

    // split-list delta & integer encode x, y, z atom coords
    outputDict.xCoordList = integerDeltaPacking16( inputDict.xCoordList, 1000 );
    outputDict.yCoordList = integerDeltaPacking16( inputDict.yCoordList, 1000 );
    outputDict.zCoordList = integerDeltaPacking16( inputDict.zCoordList, 1000 );

    // split-list delta & integer encode b-factors
    if( inputDict.bFactorList ){
        outputDict.bFactorList = integerDeltaPacking16( inputDict.bFactorList, 100 );
    }

    // delta & run-length encode atom ids
    if( inputDict.atomIdList ){
        outputDict.atomIdList = deltaRun( inputDict.atomIdList );
    }

    // run-length encode alternate labels
    if( inputDict.altLocList ){
        outputDict.altLocList = runChar( inputDict.altLocList );
    }

    // run-length & integer encode occupancies
    if( inputDict.occupancyList ){
        outputDict.occupancyList = integerRun( inputDict.occupancyList, 100 );
    }

    ///////////////
    // group data

    // run-length & delta encode group numbers
    outputDict.groupIdList = deltaRun( inputDict.groupIdList );

    // encode group types, i.e. get int32 array
    outputDict.groupTypeList = passInt32( inputDict.groupTypeList );

    // encode secondary structure, i.e. get bytes
    if( inputDict.secStructList ){
        outputDict.secStructList = passInt8( inputDict.secStructList );
    }

    // run-length encode insertion codes
    if( inputDict.insCodeList ){
        outputDict.insCodeList = runChar( inputDict.insCodeList );
    }

    // run-length & delta encode sequence indices
    if( inputDict.sequenceIndexList ){
        outputDict.sequenceIndexList = deltaRun( inputDict.sequenceIndexList );
    }

    ///////////////
    // chain data

    // encode chain ids, i.e. get bytes
    outputDict.chainIdList = passString( inputDict.chainIdList, 4 );

    // encode chain names, i.e. get bytes
    if( inputDict.chainNameList ){
        outputDict.chainNameList = passString( inputDict.chainNameList, 4 );
    }

    return outputDict;

}


export default encodeMmtf;
