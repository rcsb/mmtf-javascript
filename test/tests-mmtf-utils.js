
/////////////////////
// decoding helpers
//
QUnit.module( "mmtf utils" );

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

QUnit.test( "encodeIntegerToFloat", function( assert ) {
    var inputFloatArray = new Float32Array([
        0.12, 0.34, 5.43, 6.87, 0.02, 0.00, 46.89
    ]);
    var expectedIntArray = new Int32Array([
        12, 34, 543, 687, 2, 0, 4689
    ]);
    var divisor = 100;
    var encodedIntArray = MmtfUtils.encodeFloatToInteger( inputFloatArray, divisor );
    assert.deepEqual( encodedIntArray, expectedIntArray, "Passed!" );
});

QUnit.test( "encodeIntegerToFloat int16", function( assert ) {
    var inputFloatArray = new Float32Array([
        0.12, 0.34, 5.43, 6.87, 0.02, 0.00, 46.89
    ]);
    var expectedIntArray = new Int16Array([
        12, 34, 543, 687, 2, 0, 4689
    ]);
    var int16Array = new Int16Array( inputFloatArray.length );
    var divisor = 100;
    var encodedIntArray = MmtfUtils.encodeFloatToInteger( inputFloatArray, divisor, int16Array );
    assert.deepEqual( encodedIntArray, expectedIntArray, "Passed!" );
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
    var expected = new Int32Array([
        0, 2, 10, 4, 3, 5
    ]);
    var encoded = MmtfUtils.encodeRunLength( input );
    assert.equal( encoded.length, 6, "Passed!" );
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
        0
    ]);
    var expected = new Int32Array([
        0, 1
    ]);
    var encoded = MmtfUtils.encodeRunLength( input );
    assert.equal( encoded.length, 2, "Passed!" );
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
    var expected = new Int32Array([]);
    var encoded = MmtfUtils.encodeRunLength( input );
    assert.equal( encoded.length, 0, "Passed!" );
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
        0, 2, 3, 5, 6, 7, 3, 1, 10
    ]);
    var expected = new Int32Array([
        0, 2, 1, 2, 1, 1, -4, -2, 9
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
    var deltasSmall = new Int8Array([
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

QUnit.test( "decodeSplitListDelta empty arrays", function( assert ) {
    var deltasBig = new Int32Array([]);
    var deltasSmall = new Int8Array([]);
    var expected = new Int32Array([]);
    var decoded = MmtfUtils.decodeSplitListDelta( deltasBig, deltasSmall );
    assert.equal( decoded.length, deltasBig.length/2 + deltasSmall.length, "Passed!" );
    assert.equal( decoded.length, expected.length, "Passed!" );
    assert.deepEqual( decoded, expected, "Passed!" );
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

QUnit.test( "decodeFloatRunLength empty arrays", function( assert ) {
    var array = new Int32Array([]);
    var expected = new Float32Array([]);
    var arrayUint8 = new Uint8Array( array.buffer );
    var divisor = 100;
    var decoded = MmtfUtils.decodeFloatRunLength( arrayUint8, divisor );
    assert.equal( decoded.length, expected.length, "Passed!" );
    assert.deepEqual( decoded, expected, "Passed!" );
});
