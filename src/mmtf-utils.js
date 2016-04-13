/**
 * @file mmtf-utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

/**
 * get an Uint8Array view on the input array memory
 * @param  {TypedArray} dataArray - input array
 * @return {Uint8Array} new view on the input array memory
 */
function getUint8View( dataArray ){
    return new Uint8Array(
        dataArray.buffer, dataArray.byteOffset, dataArray.byteLength
    );
}

/**
 * get an Int8Array view on the input array memory
 * @param  {TypedArray} dataArray - input array
 * @return {Int8Array} new view on the input array memory
 */
function getInt8View( dataArray ){
    return new Int8Array(
        dataArray.buffer, dataArray.byteOffset, dataArray.byteLength
    );
}

/**
 * get an Int16Array copy of the the input array data
 * @param  {TypedArray} view - input data in big endian format
 * @param  {Int16Array} [dataArray] - pre-allocated output array
 * @return {Int16Array} copy of the input array data
 */
function getInt16( view, dataArray ){
    var o = view.byteOffset;
    var n = view.byteLength;
    var i, i2, il;
    if( !dataArray ) dataArray = new Int16Array( n / 2 );
    for( i = 0, i2 = 0, il = n / 2; i < il; ++i, i2 += 2 ){
        dataArray[ i ] = view[ i2 ] << 8 ^ view[ i2 + 1 ] << 0;
    }
    return dataArray;
}

/**
 * make big endian buffer of an int16 array
 * @param  {Array|TypedArray} array - array of int16 values
 * @return {ArrayBuffer} big endian buffer
 */
function makeInt16Buffer( array ){
    var n = array.length;
    var buffer = new ArrayBuffer( 2 * n );
    var dv = new DataView( buffer );
    for( var i = 0; i < n; ++i ){
        dv.setInt16( 2 * i, array[ i ] );
    }
    return buffer;
}

/**
 * get an Int32Array copy of the the input array data
 * @param  {TypedArray} view - input data in big endian format
 * @param  {Int32Array} [dataArray] - pre-allocated output array
 * @return {Int32Array} copy of the input array data
 */
function getInt32( view, dataArray ){
    var o = view.byteOffset;
    var n = view.byteLength;
    var i, i4, il;
    if( !dataArray ) dataArray = new Int32Array( n / 4 );
    for( i = 0, i4 = 0, il = n / 4; i < il; ++i, i4 += 4 ){
        dataArray[ i ] = (
            view[ i4     ] << 24 ^ view[ i4 + 1 ] << 16 ^
            view[ i4 + 2 ] <<  8 ^ view[ i4 + 3 ] <<  0
        );
    }
    return dataArray;
}

/**
 * get an Int32Array view on the input array memory
 * @param  {TypedArray} dataArray - input array
 * @return {Int32Array} new view on the input array memory
 */
function getInt32View( dataArray ){
    return new Int32Array(
        dataArray.buffer, dataArray.byteOffset, dataArray.byteLength/4
    );
}

/**
 * make big endian buffer of an int32 array
 * @param  {Array|TypedArray} array - array of int32 values
 * @return {ArrayBuffer} big endian buffer
 */
function makeInt32Buffer( array ){
    var n = array.length;
    var buffer = new ArrayBuffer( 4 * n );
    var dv = new DataView( buffer );
    for( var i = 0; i < n; ++i ){
        dv.setInt32( 4 * i, array[ i ] );
    }
    return buffer;
}

/**
 * decode integers into floats using given divisor
 * example:
 *     intArray: [ 12, 34, 543, 687, 2, 0, 4689 ]
 *     divisor: 100
 *     return: [ 0.12, 0.34, 5.43, 6.87, 0.02, 0.00, 46.89 ]
 * @param  {TypedArray|Array} intArray - input array containing integers
 * @param  {Number} divisor - number to devide the integers to obtain floats
 * @param  {Float32Array} [dataArray] - pre-allocated output array
 * @return {Float32Array} decoded array
 */
function decodeIntegerToFloat( intArray, divisor, dataArray ){
    var n = intArray.length;
    var invDiv = 1/divisor;
    if( !dataArray ) dataArray = new Float32Array( n );
    for( var i = 0; i < n; ++i ){
        // multiply by inverse of the divisor which is faster the division
        dataArray[ i ] = intArray[ i ] * invDiv;
    }
    return dataArray;
}

/**
 * perform run-length decoding of input array
 * example:
 *     array: [ 0, 2, 3, 5 ]  // pairs of values and length of a run
 *     return: [ 0, 0, 3, 3, 3, 3, 3 ]
 * @param  {TypedArray|Array} array - run-length encoded input array
 * @param  {TypedArray|Array} [dataArray] - pre-allocated output array
 * @return {TypedArray|Array} decoded array
 */
function decodeRunLength( array, dataArray ){
    var i, il;
    if( !dataArray ){
        // calculate the length the decoded array will have
        var fullLength = 0;
        for( i = 0, il = array.length; i < il; i+=2 ){
            fullLength += array[ i + 1 ];
        }
        // create a new array of the same type of the input array
        dataArray = new array.constructor( fullLength );
    }
    var dataOffset = 0;
    for( i = 0, il = array.length; i < il; i+=2 ){
        var value = array[ i ];  // value to be repeated
        var length = array[ i + 1 ];  // number of repeats
        for( var j = 0; j < length; ++j ){
            dataArray[ dataOffset ] = value;
            dataOffset += 1;
        }
    }
    return dataArray;
}

/**
 * perform delta decoding of the input array
 * by iterativly adding the ith element's value to the i+1th
 * example:
 *     dataArray: [ 0, 2, 1, 2, 1, 1, -4, -2, 9 ]
 *     return: [ 0, 2, 3, 5, 6, 7, 3, 1, 10 ]
 * @param  {TypedArray|Array} dataArray - delta encoded input array
 * @return {TypedArray|Array} decoded array
 */
function decodeDelta( dataArray ){
    for( var i = 1, il = dataArray.length; i < il; ++i ){
        dataArray[ i ] += dataArray[ i - 1 ];
    }
    return dataArray;
}

/**
 * perform split-list delta decoding
 * i.e. the delta values are split between two lists
 * example:
 *     bigArray: [ 200, 3, 100, 2 ]
 *     smallArray: [ 0, 2, -1, -3, 5 ]
 *     return: [ 200, 200, 202, 201, 301, 298, 303 ]
 * @param  {Uint8Array} bigArray - int32 array as bytes in big endian format,
 *                                 pairs of large delta values and number of following
 *                                 small delta values to be read from smallArray
 * @param  {Uint8Array} smallArray - int16 array as bytes in big endian format,
 *                                   small delta values
 * @param  {Int32Array} dataArray - pre-allocated output array
 * @return {Int32Array} decoded array
 */
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

/**
 * perform split-list delta decoding followed (@see decodeSplitListDelta)
 * by decoding integers into floats using given divisor (@see decodeIntegerToFloat)
 * example:
 *     bigArray: [ 100, 3, -200, 2 ]
 *     smallArray: [ 0, 2, -1, -3, 5 ]
 *     divisor: 100
 *     return: [ 1.00, 1.00, 1.02, 1.01, -0.99, -1.02, -0.97 ]
 * @param  {Uint8Array} bigArray - int32 array as bytes in big endian format,
 *                                 pairs of large delta values and number of following
 *                                 small delta values to be read from smallArray
 * @param  {Uint8Array} smallArray - int16 array as bytes in big endian format,
 *                                   small delta values
 * @param  {Integer} divisor  - number to devide the integers to obtain floats
 * @param  {Float32Array} dataArray - pre-allocated output array
 * @return {Float32Array} decoded array
 */
function decodeFloatSplitListDelta( bigArray, smallArray, divisor, dataArray ){
    var fullLength = ( bigArray.length / 4 / 2 ) + smallArray.length / 2;
    if( !dataArray ) dataArray = new Float32Array( fullLength );
    var int32View = getInt32View( dataArray );
    var int32 = decodeSplitListDelta(
        getInt32( bigArray ), getInt16( smallArray ), int32View
    );
    return decodeIntegerToFloat( int32, divisor, dataArray );
}

/**
 * perform run-length decoding followed (@see decodeRunLength)
 * by decoding integers into floats using given divisor (@see decodeIntegerToFloat)
 * example:
 *     array: [ 320, 3, 100, 2 ]
 *     divisor: 100
 *     return: [ 3.20, 3.20, 3.20, 1.00, 1.00 ]
 * @param  {Uint8Array} array - run-length encoded int32 array as bytes in big endian format
 * @param  {Integer} divisor - number to devide the integers to obtain floats
 * @param  {Float32Array} dataArray - pre-allocated output array
 * @return {Float32Array} decoded array
 */
function decodeFloatRunLength( bytes, divisor, dataArray ){
    var int32View = dataArray ? getInt32View( dataArray ) : undefined;
    var int32 = decodeRunLength( getInt32( bytes ), int32View );
    return decodeIntegerToFloat( int32, divisor, dataArray );
}

export {
    getUint8View, getInt8View,
    getInt16, makeInt16Buffer,
    getInt32, getInt32View, makeInt32Buffer,
    decodeIntegerToFloat, decodeRunLength, decodeDelta,
    decodeSplitListDelta, decodeFloatSplitListDelta, decodeFloatRunLength
};
