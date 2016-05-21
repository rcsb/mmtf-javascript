
/////////////////////
// decoding helpers
//
QUnit.module( "mmtf utils" );

QUnit.test( "getDataView", function( assert ) {
    var array = new Uint8Array( [ 1, 2, 3 ] );
    var dv = MmtfUtils.getDataView( array );
    assert.equal( dv.getUint8( 0 ), 1, "Passed!" );
    assert.equal( dv.getUint8( 1 ), 2, "Passed!" );
    assert.equal( dv.getUint8( 2 ), 3, "Passed!" );
});

QUnit.test( "getInt8View", function( assert ) {
    var buffer = new ArrayBuffer( 1 * 20 );
    var dv = new DataView( buffer );
    dv.setInt8( 0, 12 );
    dv.setInt8( 2, -4 );
    var view2 = new Uint8Array( buffer, 0, 4 );
    var int8 = MmtfUtils.getInt8View( view2 );
    assert.equal( int8[0], 12, "Passed!" );
    assert.equal( int8[1], 0, "Passed!" );
    assert.equal( int8[2], -4, "Passed!" );
});

QUnit.test( "getUint8View", function( assert ) {
    var buffer = new ArrayBuffer( 1 * 20 );
    var dv = new DataView( buffer );
    dv.setUint8( 0, 16 );
    dv.setUint8( 2, 5 );
    var view2 = new Uint8Array( buffer, 0, 4 );
    var int8 = MmtfUtils.getUint8View( view2 );
    assert.equal( int8[0], 16, "Passed!" );
    assert.equal( int8[1], 0, "Passed!" );
    assert.equal( int8[2], 5, "Passed!" );
});

QUnit.test( "getInt16", function( assert ) {
    var buffer = new ArrayBuffer( 2 * 20 );
    var dv = new DataView( buffer );
    dv.setInt16( 0, 18902 );
    dv.setInt16( 2 * 2, -4467 );
    var view2 = new Uint8Array( buffer, 0, 8 );
    var int16 = MmtfUtils.getInt16( view2, undefined, true );
    assert.equal( int16[0], 18902, "Passed!" );
    assert.equal( int16[1], 0, "Passed!" );
    assert.equal( int16[2], -4467, "Passed!" );
});

QUnit.test( "getInt32", function( assert ) {
    var buffer = new ArrayBuffer( 4 * 40 );
    var dv = new DataView( buffer );
    dv.setInt32( 0, 3418902 );
    dv.setInt32( 4 * 2, -743467 );
    var view2 = new Uint8Array( buffer, 0, 16 );
    var int32 = MmtfUtils.getInt32( view2, undefined, true );
    assert.equal( int32[0], 3418902, "Passed!" );
    assert.equal( int32[1], 0, "Passed!" );
    assert.equal( int32[2], -743467, "Passed!" );
});

QUnit.test( "makeFloat32Buffer", function( assert ) {
    var array = new Float32Array( [ 1, 2, 3 ] );
    var output = MmtfUtils.makeFloat32Buffer( array );
    var dv = new DataView( output );
    assert.close( dv.getFloat32( 0 ), 1, 0.001, "Passed!" );
    assert.equal( dv.getFloat32( 4 ), 2, 0.001, "Passed!" );
    assert.equal( dv.getFloat32( 8 ), 3, 0.001, "Passed!" );
});

QUnit.test( "decodeIntegerToFloat", function( assert ) {
    var intArray = new Int32Array([
        12, 34, 543, 687, 2, 0, 4689
    ]);
    var expectedFloatArray = new Float32Array([
        0.12, 0.34, 5.43, 6.87, 0.02, 0.00, 46.89
    ]);
    var divisor = 100;
    var decodedFloatArray = MmtfUtils.decodeIntegerToFloat( intArray, divisor );
    assert.deepEqual( decodedFloatArray, expectedFloatArray, "Passed!" );
});

QUnit.test( "encodeFloatToInteger", function( assert ) {
    var inputFloatArray = new Float32Array([
        0.12, 0.34, 5.43, 6.87, 0.02, 0.00, 46.89
    ]);
    var expected = MmtfUtils.makeInt32Buffer([
        12, 34, 543, 687, 2, 0, 4689
    ]);
    var factor = 100;
    var encoded = MmtfUtils.encodeFloatToInteger( inputFloatArray, factor );
    assert.deepEqual( encoded, expected, "Passed!" );
});

QUnit.test( "encodeFloatToInteger int16", function( assert ) {
    var inputFloatArray = new Float32Array([
        0.12, 0.34, 5.43, 6.87, 0.02, 0.00, 46.89
    ]);
    var expected = MmtfUtils.makeInt16Buffer([
        12, 34, 543, 687, 2, 0, 4689
    ]);
    var factor = 100;
    var encodedIntArray = MmtfUtils.encodeFloatToInteger( inputFloatArray, factor, 2 );
    assert.deepEqual( encodedIntArray, expected, "Passed!" );
});

QUnit.test( "encodeFloatToInteger int8", function( assert ) {
    var inputFloatArray = new Float32Array([
        0.12, 0.34, 5.43, 6.87, 0.02, 0.00, 10.89
    ]);
    var expected = new Uint8Array([
        1, 3, 5, 69, 2, 0, 108
    ]);
    var factor = 10;
    var encodedIntArray = MmtfUtils.encodeFloatToInteger( inputFloatArray, factor, 1 );
    assert.deepEqual( encodedIntArray, expected.buffer, "Passed!" );
});

QUnit.test( "decodeIntegerToFloat empty array", function( assert ) {
    var intArray = new Int32Array([]);
    var expectedFloatArray = new Float32Array([]);
    var divisor = 100;
    var decodedFloatArray = MmtfUtils.decodeIntegerToFloat( intArray, divisor );
    assert.deepEqual( decodedFloatArray, expectedFloatArray, "Passed!" );
});

QUnit.test( "decodeRunLength", function( assert ) {
    var runs = new Int32Array([
        0, 2, 3, 5
    ]);
    var expected = new Int32Array([
        0, 0, 3, 3, 3, 3, 3
    ]);
    var decoded = MmtfUtils.decodeRunLength( runs );
    assert.equal( decoded.length, 7, "Passed!" );
    assert.deepEqual( decoded, expected, "Passed!" );
});

QUnit.test( "encodeRunLength", function( assert ) {
    var input = new Int32Array([
        0, 0, 10, 10, 10, 10, 3, 3, 3, 3, 3
    ]);
    var expected = MmtfUtils.makeInt32Buffer([
        0, 2, 10, 4, 3, 5
    ]);
    var encoded = MmtfUtils.encodeRunLength( input );
    assert.deepEqual( encoded, expected, "Passed!" );
});

QUnit.test( "decodeRunLength single value", function( assert ) {
    var runs = new Int32Array([
        0, 1
    ]);
    var expected = new Int32Array([
        0
    ]);
    var decoded = MmtfUtils.decodeRunLength( runs );
    assert.equal( decoded.length, 1, "Passed!" );
    assert.deepEqual( decoded, expected, "Passed!" );
});

QUnit.test( "encodeRunLength single value", function( assert ) {
    var input = new Int32Array([
        100
    ]);
    var expected = MmtfUtils.makeInt32Buffer([
        100, 1
    ]);
    var encoded = MmtfUtils.encodeRunLength( input );
    assert.deepEqual( encoded, expected, "Passed!" );
});

QUnit.test( "decodeRunLength empty array", function( assert ) {
    var runs = new Int32Array([]);
    var expected = new Int32Array([]);
    var decoded = MmtfUtils.decodeRunLength( runs );
    assert.equal( decoded.length, 0, "Passed!" );
    assert.deepEqual( decoded, expected, "Passed!" );
});

QUnit.test( "encodeRunLength empty input", function( assert ) {
    var input = new Int32Array([]);
    var expected = MmtfUtils.makeInt32Buffer([]);
    var encoded = MmtfUtils.encodeRunLength( input );
    assert.deepEqual( encoded, expected, "Passed!" );
});

QUnit.test( "decodeDelta", function( assert ) {
    var deltas = new Int32Array([
        0, 2, 1, 2, 1, 1, -4, -2, 9
    ]);
    var expected = new Int32Array([
        0, 2, 3, 5, 6, 7, 3, 1, 10
    ]);
    var decoded = MmtfUtils.decodeDelta( deltas );
    assert.equal( decoded.length, expected.length, "Passed!" );
    assert.deepEqual( decoded, expected, "Passed!" );
});

QUnit.test( "encodeDelta", function( assert ) {
    var input = new Int32Array([
        -2, 2, 3, 5, 6, 7, 3, 1, 10
    ]);
    var expected = new Int32Array([
        -2, 4, 1, 2, 1, 1, -4, -2, 9
    ]);
    var encoded = MmtfUtils.encodeDelta( input );
    assert.equal( encoded.length, expected.length, "Passed!" );
    assert.deepEqual( encoded, expected, "Passed!" );
});

QUnit.test( "decodeDelta empty array", function( assert ) {
    var deltas = new Int32Array([]);
    var expected = new Int32Array([]);
    var decoded = MmtfUtils.decodeDelta( deltas );
    assert.equal( decoded.length, expected.length, "Passed!" );
    assert.deepEqual( decoded, expected, "Passed!" );
});

QUnit.test( "decodeSplitListDelta", function( assert ) {
    var deltasBig = new Int32Array([
        200, 3, 100, 2
    ]);
    var deltasSmall = new Int16Array([
        0, 2, -1, -3, 5
    ]);
    var expected = new Int32Array([
        200, 200, 202, 201, 301, 298, 303
    ]);
    var decoded = MmtfUtils.decodeSplitListDelta( deltasBig, deltasSmall );
    assert.equal( decoded.length, deltasBig.length/2 + deltasSmall.length, "Passed!" );
    assert.equal( decoded.length, expected.length, "Passed!" );
    assert.deepEqual( decoded, expected, "Passed!" );
});

QUnit.test( "encodeSplitListDelta", function( assert ) {
    var intArray = new Int32Array([
        0x7FFF + 200, 0x7FFF + 200, 0x7FFF + 202, 0x7FFF + 201, 101, 98, 303
    ]);
    var deltasBig = MmtfUtils.makeInt32Buffer([
        0x7FFF + 200, 3, -0x7FFF - 100, 2
    ]);
    var deltasSmall = MmtfUtils.makeInt16Buffer([
        0, 2, -1, -3, 205
    ]);
    var expected = [ deltasBig, deltasSmall ];
    var encoded = MmtfUtils.encodeSplitListDelta( intArray );
    assert.deepEqual( encoded, expected, "Passed!" );
});

QUnit.test( "encodeSplitListDelta useInt8", function( assert ) {
    var intArray = new Int32Array([
        0x7FFF + 200, 0x7FFF + 200, 0x7FFF + 202, 0x7FFF + 201, 101, 98, 103
    ]);
    var deltasBig = MmtfUtils.makeInt32Buffer([
        0x7FFF + 200, 3, -0x7FFF - 100, 2
    ]);
    var deltasSmall = new Int8Array([
        0, 2, -1, -3, 5
    ]);
    var expected = [ deltasBig, deltasSmall ];
    var encoded = MmtfUtils.encodeSplitListDelta( intArray, true );
    assert.deepEqual( encoded, expected, "Passed!" );
});

QUnit.test( "decodeSplitListDelta empty arrays", function( assert ) {
    var deltasBig = new Int32Array([]);
    var deltasSmall = new Int8Array([]);
    var expected = new Int32Array([]);
    var decoded = MmtfUtils.decodeSplitListDelta( deltasBig, deltasSmall );
    assert.equal( decoded.length, deltasBig.length/2 + deltasSmall.length, "Passed!" );
    assert.equal( decoded.length, expected.length, "Passed!" );
    assert.deepEqual( decoded, expected, "Passed!" );
});

QUnit.test( "encodeSplitListDelta empty input", function( assert ) {
    var intArray = new Int32Array([]);
    var deltasBig = MmtfUtils.makeInt32Buffer([])
    var deltasSmall = MmtfUtils.makeInt16Buffer([])
    var expected = [ deltasBig, deltasSmall ];
    var encoded = MmtfUtils.encodeSplitListDelta( intArray );
    // assert.equal( intArray.length, encoded[ 0 ].length/2 + encoded[ 1 ].length, "Passed!" );
    // assert.equal( encoded[ 0 ].length, expected[ 0 ].length, "Passed!" );
    // assert.equal( encoded[ 1 ].length, expected[ 1 ].length, "Passed!" );
    assert.deepEqual( encoded, expected, "Passed!" );
});

QUnit.test( "decodeFloatSplitListDelta", function( assert ) {
    var deltasBigBuffer = MmtfUtils.makeInt32Buffer([
        100, 3, -200, 2
    ]);
    var deltasSmallBuffer = MmtfUtils.makeInt16Buffer([
        0, 2, -1, -3, 5
    ]);
    var expected = new Float32Array([
        1.00, 1.00, 1.02, 1.01, -0.99, -1.02, -0.97
    ]);
    var deltasBigUint8 = new Uint8Array( deltasBigBuffer );
    var deltasSmallUint8 = new Uint8Array( deltasSmallBuffer );
    var divisor = 100;
    var decoded = MmtfUtils.decodeFloatSplitListDelta(
        deltasBigUint8, deltasSmallUint8, divisor
    );
    assert.equal(
        decoded.length,
        deltasBigBuffer.byteLength/4/2 + deltasSmallBuffer.byteLength/2,
        "Passed!"
    );
    assert.close( decoded[0], expected[0], 0.001, "Passed!" );
    assert.close( decoded[1], expected[1], 0.001, "Passed!" );
    assert.close( decoded[2], expected[2], 0.001, "Passed!" );
    assert.close( decoded[3], expected[3], 0.001, "Passed!" );
    assert.close( decoded[4], expected[4], 0.001, "Passed!" );
    assert.close( decoded[5], expected[5], 0.001, "Passed!" );
    assert.close( decoded[6], expected[6], 0.001, "Passed!" );
});

QUnit.test( "encodeFloatSplitListDelta", function( assert ) {
    var intArray = new Float32Array([
        329 + 2.001, 329 + 2.10, 329 + 2.02, 329 + 2.01, 1.01, 2.98, 300.003
    ]);
    var deltasBig = MmtfUtils.makeInt32Buffer([
        32900 + 200, 3, -32900 - 100, 2
    ]);
    var deltasSmall = MmtfUtils.makeInt16Buffer([
        10, -8, -1, 197, 29702
    ]);
    var expected = [ deltasBig, deltasSmall ];
    var factor = 100;
    var encoded = MmtfUtils.encodeFloatSplitListDelta( intArray, factor );
    assert.deepEqual( encoded, expected, "Passed!" );
});

QUnit.test( "decodeFloatSplitListDelta empty arrays", function( assert ) {
    var deltasBig = new Int32Array([]);
    var deltasSmall = new Int16Array([]);
    var expected = new Float32Array([]);
    var deltasBigUint8 = new Uint8Array( deltasBig.buffer );
    var deltasSmallUint8 = new Uint8Array( deltasSmall.buffer );
    var divisor = 100;
    var decoded = MmtfUtils.decodeFloatSplitListDelta(
        deltasBigUint8, deltasSmallUint8, divisor
    );
    assert.equal( decoded.length, deltasBig.length/2 + deltasSmall.length, "Passed!" );
    assert.deepEqual( decoded, expected, "Passed!" );
});

QUnit.test( "encodeFloatSplitListDelta empty input", function( assert ) {
    var intArray = new Float32Array([]);
    var deltasBig = MmtfUtils.makeInt32Buffer([]);
    var deltasSmall = MmtfUtils.makeInt16Buffer([]);
    var expected = [ deltasBig, deltasSmall ];
    var factor = 100;
    var encoded = MmtfUtils.encodeFloatSplitListDelta( intArray, factor );
    assert.deepEqual( encoded, expected, "Passed!" );
});

QUnit.test( "decodeFloatRunLength", function( assert ) {
    var arrayBuffer = MmtfUtils.makeInt32Buffer([
        320, 3, 100, 2
    ]);
    var expected = new Float32Array([
        3.20, 3.20, 3.20, 1.00, 1.00
    ]);
    var arrayUint8 = new Uint8Array( arrayBuffer );
    var divisor = 100;
    var decoded = MmtfUtils.decodeFloatRunLength( arrayUint8, divisor );
    assert.equal( decoded.length, expected.length, "Passed!" );
    assert.close( decoded[0], expected[0], 0.001, "Passed!" );
    assert.close( decoded[1], expected[1], 0.001, "Passed!" );
    assert.close( decoded[2], expected[2], 0.001, "Passed!" );
    assert.close( decoded[3], expected[3], 0.001, "Passed!" );
    assert.close( decoded[4], expected[4], 0.001, "Passed!" );
});

QUnit.test( "encodeFloatRunLength", function( assert ) {
    var floatInput = new Float32Array([
        3.20, 3.20, 3.20, 1.00, 1.00
    ]);
    var expected = MmtfUtils.makeInt32Buffer([
        320, 3, 100, 2
    ]);
    var divisor = 100;
    var encoded = MmtfUtils.encodeFloatRunLength( floatInput, divisor );
    assert.equal( encoded.length, expected.length, "Passed!" );
    assert.deepEqual( encoded, expected, "Passed!" );
});

QUnit.test( "decodeFloatRunLength empty arrays", function( assert ) {
    var array = new Int32Array([]);
    var expected = new Float32Array([]);
    var arrayUint8 = new Uint8Array( array.buffer );
    var divisor = 100;
    var decoded = MmtfUtils.decodeFloatRunLength( arrayUint8, divisor );
    assert.equal( decoded.length, expected.length, "Passed!" );
    assert.deepEqual( decoded, expected, "Passed!" );
});

QUnit.test( "encodeFloatRunLength empty array", function( assert ) {
    var floatInput = new Float32Array([]);
    var expected = MmtfUtils.makeInt32Buffer([]);
    var divisor = 100;
    var encoded = MmtfUtils.encodeFloatRunLength( floatInput, divisor );
    assert.deepEqual( encoded, expected, "Passed!" );
});
