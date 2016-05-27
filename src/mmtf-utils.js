/**
 * @file mmtf-utils
 * @private
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

/**
 * mmtf utils module.
 * @module MmtfUtils
 */


function getView( ctor, typedArray, elemSize ){
    return typedArray ? new ctor(
        typedArray.buffer,
        typedArray.byteOffset,
        typedArray.byteLength / ( elemSize || 1 )
    ) : undefined;
}

function getDataView( typedArray ){
    return getView( DataView, typedArray );
}

/**
 * get an Uint8Array view on the input array memory
 * @static
 * @param  {TypedArray} dataArray - input array
 * @return {Uint8Array} new view on the input array memory
 */
function getUint8View( typedArray ){
    return getView( Uint8Array, typedArray );
}

/**
 * get an Int8Array view on the input array memory
 * @static
 * @param  {TypedArray} dataArray - input array
 * @return {Int8Array} new view on the input array memory
 */
function getInt8View( typedArray ){
    return getView( Int8Array, typedArray );
}

/**
 * get an Int16Array view on the input array memory
 * @static
 * @param  {TypedArray} dataArray - input array
 * @return {Int16Array} new view on the input array memory
 */
function getInt16View( typedArray ){
    return getView( Int16Array, typedArray, 2 );
}

/**
 * get an Int32Array view on the input array memory
 * @static
 * @param  {TypedArray} dataArray - input array
 * @return {Int32Array} new view on the input array memory
 */
function getInt32View( typedArray ){
    return getView( Int32Array, typedArray, 4 );
}

function getFloat32View( typedArray ){
    return getView( Float32Array, typedArray, 4 );
}


/**
 * get an Int16Array copy of the the input array data
 * @static
 * @param  {TypedArray} view - input data in big endian format
 * @param  {Int16Array} [dataArray] - pre-allocated output array
 * @return {Int16Array} copy of the input array data
 */
function decodeInt16( bytes, output ){
    var n = bytes.length / 2;
    if( !output ) output = new Int16Array( n );
    for( var i = 0, i2 = 0; i < n; ++i, i2 += 2 ){
        output[ i ] = bytes[ i2 ] << 8 ^ bytes[ i2 + 1 ] << 0;
    }
    return output;
}

/**
 * make big endian buffer of an int16 array
 * @static
 * @param  {Array|TypedArray} array - array of int16 values
 * @return {ArrayBuffer} big endian buffer
 */
function encodeInt16( array, output ){
    var n = array.length;
    if( !output ) output = new Uint8Array( 2 * n );
    var dv = getDataView( output );
    for( var i = 0; i < n; ++i ){
        dv.setInt16( 2 * i, array[ i ] );
    }
    return getUint8View( output );
}

/**
 * get an Int32Array copy of the the input array data
 * @static
 * @param  {TypedArray} view - input data in big endian format
 * @param  {Int32Array} [dataArray] - pre-allocated output array
 * @return {Int32Array} copy of the input array data
 */
function decodeInt32( bytes, output ){
    var n = bytes.length / 4;
    if( !output ) output = new Int32Array( n );
    for( var i = 0, i4 = 0; i < n; ++i, i4 += 4 ){
        output[ i ] = (
            bytes[ i4     ] << 24 ^ bytes[ i4 + 1 ] << 16 ^
            bytes[ i4 + 2 ] <<  8 ^ bytes[ i4 + 3 ] <<  0
        );
    }
    return output;
}

/**
 * make big endian buffer of an int32 array
 * @static
 * @param  {Array|TypedArray} array - array of int32 values
 * @return {ArrayBuffer} big endian buffer
 */
function encodeInt32( array, output ){
    var n = array.length;
    if( !output ) output = new Uint8Array( 4 * n );
    var dv = getDataView( output );
    for( var i = 0; i < n; ++i ){
        dv.setInt32( 4 * i, array[ i ] );
    }
    return getUint8View( output );
}

function decodeFloat32( bytes, output ){
    var n = bytes.length;
    if( !output ) output = new Float32Array( n / 4 );
    var dvOut = getDataView( output );
    var dvIn = getDataView( bytes );
    for( var i = 0, i4 = 0, il = n / 4; i < il; ++i, i4 += 4 ){
        dvOut.setFloat32( i4, dvIn.getFloat32( i4 ), true );
    }
    return output;
}

function encodeFloat32( array, output ){
    var n = array.length;
    if( !output ) output = new Uint8Array( 4 * n );
    var dv = getDataView( output );
    for( var i = 0; i < n; ++i ){
        dv.setFloat32( 4 * i, array[ i ] );
    }
    return getUint8View( output );
}



/**
 * decode integers into floats using given divisor
 * example:
 *     intArray: [ 12, 34, 543, 687, 2, 0, 4689 ]
 *     divisor: 100
 *     return: [ 0.12, 0.34, 5.43, 6.87, 0.02, 0.00, 46.89 ]
 * @static
 * @param  {TypedArray|Array} intArray - input array containing integers
 * @param  {Number} divisor - number to devide the integers to obtain floats
 * @param  {Float32Array} [dataArray] - pre-allocated output array
 * @return {Float32Array} decoded array
 */
function decodeInteger( intArray, divisor, output ){
    var n = intArray.length;
    var invDiv = 1/divisor;
    if( !output ) output = new Float32Array( n );
    for( var i = 0; i < n; ++i ){
        // multiply by inverse of the divisor which is faster then division
        output[ i ] = intArray[ i ] * invDiv;
    }
    return output;
}

function encodeInteger( floatArray, factor, output ){
    var n = floatArray.length;
    if( !output ) output = new Int32Array( n );
    for( var i = 0; i < n; ++i ){
        output[ i ] = Math.round( floatArray[ i ] * factor );
    }
    return output;
}



/**
 * perform run-length decoding of input array
 * example:
 *     array: [ 0, 2, 3, 5 ]  // pairs of values and length of a run
 *     return: [ 0, 0, 3, 3, 3, 3, 3 ]
 * @static
 * @param  {TypedArray|Array} array - run-length encoded input array
 * @param  {TypedArray|Array} [dataArray] - pre-allocated output array
 * @return {TypedArray|Array} decoded array
 */
function decodeRun( array, output ){
    var i, il;
    if( !output ){
        // calculate the length the decoded array will have
        var fullLength = 0;
        for( i = 0, il = array.length; i < il; i+=2 ){
            fullLength += array[ i + 1 ];
        }
        // create a new array of the same type of the input array
        output = new array.constructor( fullLength );
    }
    var dataOffset = 0;
    for( i = 0, il = array.length; i < il; i+=2 ){
        var value = array[ i ];  // value to be repeated
        var length = array[ i + 1 ];  // number of repeats
        for( var j = 0; j < length; ++j ){
            output[ dataOffset ] = value;
            dataOffset += 1;
        }
    }
    return output;
}

function encodeRun( array ){
    if( array.length === 0 ) return new Int32Array();
    var i, il;
    // calculate output size
    var fullLength = 2;
    for( i = 1, il = array.length; i < il; ++i ){
        if( array[ i - 1 ] !== array[ i ] ){
            fullLength += 2;
        }
    }
    var output = new Int32Array( fullLength );
    var offset = 0;
    var runLength = 1;
    for( i = 1, il = array.length; i < il; ++i ){
        if( array[ i - 1 ] !== array[ i ] ){
            output[ offset ] = array[ i - 1 ];
            output[ offset + 1 ] = runLength;
            runLength = 1;
            offset += 2;
        }else{
            runLength += 1;
        }
    }
    output[ offset ] = array[ array.length - 1 ];
    output[ offset + 1 ] = runLength;
    return output;
}



/**
 * perform delta decoding of the input array
 * by iterativly adding the ith element's value to the i+1th
 * example:
 *     dataArray: [ 0, 2, 1, 2, 1, 1, -4, -2, 9 ]
 *     return: [ 0, 2, 3, 5, 6, 7, 3, 1, 10 ]
 * @static
 * @param  {TypedArray|Array} dataArray - delta encoded input array
 * @return {TypedArray|Array} decoded array
 */
function decodeDelta( array, output ){
    var n = array.length;
    if( !output ) output = new array.constructor( n );
    if( n ) output[ 0 ] = array[ 0 ];
    for( var i = 1; i < n; ++i ){
        output[ i ] = array[ i ] + output[ i - 1 ];
    }
    return output;
}

function encodeDelta( array, output ){
    var n = array.length;
    if( !output ) output = new array.constructor( n );
    output[ 0 ] = array[ 0 ];
    for( var i = 1; i < n; ++i ){
        output[ i ] = array[ i ] - array[ i - 1 ];
    }
    return output;
}



/**
 * [decodePacking description]
 * @param  {[type]} int16or8 [description]
 * @param  {[type]} output   [description]
 * @return {[type]}          [description]
 */
function decodePacking( int16or8, output ){
    var upperLimit = int16or8 instanceof Int8Array ? 0x7F : 0x7FFF;
    var lowerLimit = -upperLimit - 1;
    var n = int16or8.length;
    var i, j;
    if( !output ){
        var fullLength = 0;
        for( i = 0; i < n; ++i ){
            if( int16or8[ i ] < upperLimit && int16or8[ i ] > lowerLimit ){
                ++fullLength;
            }
        }
        output = new Int32Array( fullLength );
    }
    i = 0;
    j = 0;
    while( i < n ){
        var value = 0;
        while( int16or8[ i ] === upperLimit || int16or8[ i ] === lowerLimit ){
            value += int16or8[ i ];
            i += 1;
            if( int16or8[ i ] === 0 ){
                break;
            }
        }
        value += int16or8[ i ];
        i += 1;
        output[ j ] = value;
        j += 1;
    }
    return output;
}

/**
 * integer packing using recursive indexing
 * @param  {Array|TyepedArray} intArray [description]
 * @param  {Boolean} useInt8  [description]
 * @return {Int16Array|Int8Array}          [description]
 */
function encodePacking( intArray, useInt8 ){
    var upperLimit = useInt8 ? 0x7F : 0x7FFF;
    var lowerLimit = -upperLimit - 1;
    var i;
    var n = intArray.length;
    var size = 0;
    for( i = 0; i < n; ++i ){
        var value = intArray[ i ];
        if( value === 0 ){
            size += 1;
        }else if( value === upperLimit || value === lowerLimit ){
            size += 2;
        }else if( value > 0) {
            size += Math.ceil( value / upperLimit );
        }else {
            size += Math.ceil( value / lowerLimit );
        }
    }
    var output = useInt8 ? new Int8Array( size ) : new Int16Array( size );
    var j = 0;
    for( i = 0; i < n; ++i ){
        var value = intArray[ i ];
        if( value >= 0) {
            while( value >= upperLimit ){
                output[ j ] = upperLimit;
                j += 1;
                value -= upperLimit;
            }
        }else{
            while( value <= lowerLimit ){
                output[ j ] = lowerLimit;
                j += 1;
                value -= lowerLimit;
            }
        }
        output[ j ] = value;
        j += 1;
    }
    return output;
}



function decodeDeltaRun( array, output ){
    return decodeDelta( decodeRun( array ), output );
}

function encodeDeltaRun( array ){
    return encodeRun( encodeDelta( array ) );
}



/**
 * perform run-length decoding followed (@see decodeRunLength)
 * by decoding integers into floats using given divisor (@see decodeIntegerToFloat)
 * example:
 *     array: [ 320, 3, 100, 2 ]
 *     divisor: 100
 *     return: [ 3.20, 3.20, 3.20, 1.00, 1.00 ]
 * @static
 * @param  {Uint8Array} array - run-length encoded int32 array as bytes in big endian format
 * @param  {Integer} divisor - number to devide the integers to obtain floats
 * @param  {Float32Array} dataArray - pre-allocated output array
 * @return {Float32Array} decoded array
 */
function decodeIntegerRun( intArray, divisor, output ){
    return decodeInteger(
        decodeRun( intArray, getInt32View( output ) ), divisor, output
    );
}

function encodeIntegerRun( floatArray, factor ){
    return encodeRun( encodeInteger( floatArray, factor ) );
}



function decodeIntegerDelta( intArray, divisor, output ){
    return decodeInteger(
        decodeDelta( intArray, getInt32View( output ) ), divisor, output
    );
}

function encodeIntegerDelta( floatArray, factor, output ){
    return encodeDelta( encodeInteger( floatArray, factor ), output );
}



function decodeIntegerPacking( int16or8, divisor, output ){
    return decodeInteger(
        decodePacking( int16or8, getInt32View( output ) ), divisor, output
    );
}

function encodeIntegerPacking( floatArray, factor, useInt8 ){
    return encodePacking( encodeInteger( floatArray, factor ), useInt8 );
}



function decodeIntegerDeltaPacking( int16or8, divisor, output ){
    var unpacked = decodePacking( int16or8, getInt32View( output ) );
    return decodeIntegerDelta( unpacked, divisor, getFloat32View( unpacked ) );
}

function encodeIntegerDeltaPacking( floatArray, factor, useInt8 ){
    return encodePacking( encodeIntegerDelta( floatArray, factor ), useInt8 );
}



function decodeBytes( bytes ){
    var dv = getDataView( bytes );
    var type = dv.getInt32( 0 );
    var size = dv.getInt32( 4 );
    var param = bytes.subarray( 8, 12 );
    var bytes = bytes.subarray( 12 );
    return [ type, bytes, size, param ];
}

function encodeBytes( type, size, param, bytes ){
    var buffer = new ArrayBuffer( 12 + bytes.byteLength );
    var out = new Uint8Array( buffer );
    var dv = new DataView( buffer );
    dv.setInt32( 0, type );
    dv.setInt32( 4, size );
    if( param ) out.set( param, 8 );
    out.set( bytes, 12 );
    return out;
}


export {
    getDataView, getUint8View, getInt8View, getInt16View, getInt32View, getFloat32View,
    decodeInt16, encodeInt16,
    decodeInt32, encodeInt32,
    decodeFloat32, encodeFloat32,
    decodeInteger, encodeInteger,
    decodeRun, encodeRun,
    decodeDelta, encodeDelta,
    decodePacking, encodePacking,
    decodeDeltaRun, encodeDeltaRun,
    decodeIntegerRun, encodeIntegerRun,
    decodeIntegerDelta, encodeIntegerDelta,
    decodeIntegerPacking, encodeIntegerPacking,
    decodeIntegerDeltaPacking, encodeIntegerDeltaPacking,
    decodeBytes, encodeBytes
};
