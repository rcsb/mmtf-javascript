'use strict';

/**
 * @file msgpack-decode-helpers
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

function getUint8View( dataArray ){
    return new Uint8Array(
        dataArray.buffer, dataArray.byteOffset, dataArray.byteLength
    );
}

function getInt8View( dataArray ){
    return new Int8Array(
        dataArray.buffer, dataArray.byteOffset, dataArray.byteLength
    );
}

function getInt16( view, dataArray, littleEndian ){
    var o = view.byteOffset;
    var n = view.byteLength;
    var i, i2, il;
    if( !dataArray ) dataArray = new Int16Array( n / 2 );
    if( littleEndian ){
        var dv = new DataView( view.buffer );
        for( i = 0, i2 = 0, il = n / 2; i < il; ++i, i2 += 2 ){
            dataArray[ i ] = dv.getInt16( o + i2, littleEndian );
        }
    }else{
        for( i = 0, i2 = 0, il = n / 2; i < il; ++i, i2 += 2 ){
            dataArray[ i ] = view[ i2 ] << 8 ^ view[ i2 + 1 ] << 0;
        }
    }
    return dataArray;
}

function getInt32( view, dataArray, littleEndian ){
    var o = view.byteOffset;
    var n = view.byteLength;
    var i, i4, il;
    if( !dataArray ) dataArray = new Int32Array( n / 4 );
    if( littleEndian ){
        var dv = new DataView( view.buffer );
        for( i = 0, i4 = 0, il = n / 4; i < il; ++i, i4 += 4 ){
            dataArray[ i ] = dv.getInt32( o + i4, littleEndian );
        }
    }else{
        for( i = 0, i4 = 0, il = n / 4; i < il; ++i, i4 += 4 ){
            dataArray[ i ] = (
                view[ i4     ] << 24 ^ view[ i4 + 1 ] << 16 ^
                view[ i4 + 2 ] <<  8 ^ view[ i4 + 3 ] <<  0
            );
        }
    }
    return dataArray;
}

function getInt32View( dataArray ){
    return new Int32Array(
        dataArray.buffer, dataArray.byteOffset, dataArray.byteLength/4
    );
}

function decodeFloat( intArray, divisor, dataArray ){
    var n = intArray.length;
    var invDiv = 1/divisor;
    if( !dataArray ) dataArray = new Float32Array( n );
    for( var i = 0; i < n; ++i ){
        dataArray[ i ] = intArray[ i ] * invDiv;
    }
    return dataArray;
}

function decodeRunLength( array, dataArray ){
    var i, il;
    if( !dataArray ){
        var fullLength = 0;
        for( i = 0, il = array.length; i < il; i+=2 ){
            fullLength += array[ i + 1 ];
        }
        dataArray = new array.constructor( fullLength );
    }
    var dataOffset = 0;
    for( i = 0, il = array.length; i < il; i+=2 ){
        var value = array[ i ];
        var length = array[ i + 1 ];
        for( var j = 0; j < length; ++j ){
            dataArray[ dataOffset ] = value;
            dataOffset += 1;
        }
    }
    return dataArray;
}

function decodeDelta( dataArray ){
    for( var i = 1, il = dataArray.length; i < il; ++i ){
        dataArray[ i ] += dataArray[ i - 1 ];
    }
    return dataArray;
}

function decodeSplitListDelta( bigArray, smallArray, dataArray ){
    var fullLength = ( bigArray.length / 2 ) + smallArray.length;
    if( !dataArray ) dataArray = new Int32Array( fullLength );
    var dataOffset = 0;
    var smallOffset = 0;
    for( var i = 0, il = bigArray.length; i < il; i+=2 ){
        var value = bigArray[ i ];
        var length = bigArray[ i + 1 ];
        dataArray[ dataOffset ] = value;
        if( i !== 0 ){
            dataArray[ dataOffset ] += dataArray[ dataOffset - 1 ];
        }
        dataOffset += 1;
        for( var j = 0; j < length; ++j ){
            dataArray[ dataOffset ] = dataArray[ dataOffset - 1 ] + smallArray[ smallOffset ];
            dataOffset += 1;
            smallOffset += 1;
        }
    }
    return dataArray;
}

function decodeFloatSplitList( bigArray, smallArray, divisor, dataArray, littleEndian ){
    var int32View = dataArray ? getInt32View( dataArray ) : undefined;
    var int32 = decodeSplitListDelta(
        getInt32( bigArray, undefined, littleEndian ),
        getInt16( smallArray, undefined, littleEndian ),
        int32View
    );
    return decodeFloat( int32, divisor, dataArray );
}

function decodeFloatRunLength( array, divisor, dataArray, littleEndian ){
    var int32View = dataArray ? getInt32View( dataArray ) : undefined;
    var int32 = decodeRunLength( getInt32( array, undefined, littleEndian ), int32View );
    return decodeFloat( int32, divisor, dataArray );
}

exports.getUint8View = getUint8View;
exports.getInt8View = getInt8View;
exports.getInt16 = getInt16;
exports.getInt32 = getInt32;
exports.getInt32View = getInt32View;
exports.decodeFloat = decodeFloat;
exports.decodeRunLength = decodeRunLength;
exports.decodeDelta = decodeDelta;
exports.decodeSplitListDelta = decodeSplitListDelta;
exports.decodeFloatSplitList = decodeFloatSplitList;
exports.decodeFloatRunLength = decodeFloatRunLength;