
/////////////////////
// decoding helpers
//
QUnit.module( "decoding helpers" );

QUnit.test( "getInt8View", function( assert ) {
    var buffer = new ArrayBuffer( 1 * 20 );
    var view = new Int8Array( buffer, 4 );
    view[0] = 12;
    view[2] = -4;
    var view2 = new Uint8Array( buffer, 4 );
    var int8 = getInt8View( view2 );
    assert.equal( int8[0], 12, "Passed!" );
    assert.equal( int8[1], 0, "Passed!" );
    assert.equal( int8[2], -4, "Passed!" );
});

QUnit.test( "getUint8View", function( assert ) {
    var buffer = new ArrayBuffer( 1 * 20 );
    var view = new Uint8Array( buffer, 4 );
    view[0] = 16;
    view[2] = 5;
    var view2 = new Uint8Array( buffer, 4 );
    var int8 = getUint8View( view2 );
    assert.equal( int8[0], 16, "Passed!" );
    assert.equal( int8[1], 0, "Passed!" );
    assert.equal( int8[2], 5, "Passed!" );
});

QUnit.test( "getInt16", function( assert ) {
    var buffer = new ArrayBuffer( 2 * 20 );
    var view = new Int16Array( buffer, 8 );
    view[0] = 18902;
    view[2] = -4467;
    var view2 = new Uint8Array( buffer, 8 );
    var int16 = getInt16( view2, undefined, true );
    assert.equal( int16[0], 18902, "Passed!" );
    assert.equal( int16[1], 0, "Passed!" );
    assert.equal( int16[2], -4467, "Passed!" );
});

QUnit.test( "getInt32", function( assert ) {
    var buffer = new ArrayBuffer( 4 * 40 );
    var view = new Int32Array( buffer, 16 );
    view[0] = 3418902;
    view[2] = -743467;
    var view2 = new Uint8Array( buffer, 16 );
    var int32 = getInt32( view2, undefined, true );
    assert.equal( int32[0], 3418902, "Passed!" );
    assert.equal( int32[1], 0, "Passed!" );
    assert.equal( int32[2], -743467, "Passed!" );
});

QUnit.test( "decodeFloat", function( assert ) {
    var intArray = new Int32Array([
        12, 34, 543, 687, 2, 0, 4689
    ]);
    var expectedFloatArray = new Float32Array([
        0.12, 0.34, 5.43, 6.87, 0.02, 0.00, 46.89
    ]);
    var divisor = 100;
    var decodedFloatArray = decodeFloat( intArray, divisor );
    assert.deepEqual( decodedFloatArray, expectedFloatArray, "Passed!" );
});

QUnit.test( "decodeFloat empty array", function( assert ) {
    var intArray = new Int32Array([]);
    var expectedFloatArray = new Float32Array([]);
    var divisor = 100;
    var decodedFloatArray = decodeFloat( intArray, divisor );
    assert.deepEqual( decodedFloatArray, expectedFloatArray, "Passed!" );
});

QUnit.test( "decodeRunLength", function( assert ) {
    var runs = new Int32Array([
        0, 2, 3, 5
    ]);
    var expected = new Int32Array([
        0, 0, 3, 3, 3, 3, 3
    ]);
    var decoded = decodeRunLength( runs );
    assert.equal( decoded.length, 7, "Passed!" );
    assert.deepEqual( decoded, expected, "Passed!" );
});

QUnit.test( "decodeRunLength single value", function( assert ) {
    var runs = new Int32Array([
        0, 1
    ]);
    var expected = new Int32Array([
        0
    ]);
    var decoded = decodeRunLength( runs );
    assert.equal( decoded.length, 1, "Passed!" );
    assert.deepEqual( decoded, expected, "Passed!" );
});

QUnit.test( "decodeRunLength empty array", function( assert ) {
    var runs = new Int32Array([]);
    var expected = new Int32Array([]);
    var decoded = decodeRunLength( runs );
    assert.equal( decoded.length, 0, "Passed!" );
    assert.deepEqual( decoded, expected, "Passed!" );
});

QUnit.test( "decodeDelta", function( assert ) {
    var deltas = new Int32Array([
        0, 2, 1, 2, 1, 1, -4, -2, 9
    ]);
    var expected = new Int32Array([
        0, 2, 3, 5, 6, 7, 3, 1, 10
    ]);
    var decoded = decodeDelta( deltas );
    assert.equal( decoded.length, expected.length, "Passed!" );
    assert.deepEqual( decoded, expected, "Passed!" );
});

QUnit.test( "decodeDelta empty array", function( assert ) {
    var deltas = new Int32Array([]);
    var expected = new Int32Array([]);
    var decoded = decodeDelta( deltas );
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
    var decoded = decodeSplitListDelta( deltasBig, deltasSmall );
    assert.equal( decoded.length, deltasBig.length/2 + deltasSmall.length, "Passed!" );
    assert.equal( decoded.length, expected.length, "Passed!" );
    assert.deepEqual( decoded, expected, "Passed!" );
});

QUnit.test( "decodeSplitListDelta empty arrays", function( assert ) {
    var deltasBig = new Int32Array([]);
    var deltasSmall = new Int8Array([]);
    var expected = new Int32Array([]);
    var decoded = decodeSplitListDelta( deltasBig, deltasSmall );
    assert.equal( decoded.length, deltasBig.length/2 + deltasSmall.length, "Passed!" );
    assert.equal( decoded.length, expected.length, "Passed!" );
    assert.deepEqual( decoded, expected, "Passed!" );
});

QUnit.test( "decodeFloatSplitList", function( assert ) {
    var deltasBig = new Int32Array([
        100, 3, -200, 2
    ]);
    var deltasSmall = new Int16Array([
        0, 2, -1, -3, 5
    ]);
    var expected = new Float32Array([
        1.00, 1.00, 1.02, 1.01, -0.99, -1.02, -0.97
    ]);
    var deltasBigUint8 = new Uint8Array( deltasBig.buffer );
    var deltasSmallUint8 = new Uint8Array( deltasSmall.buffer );
    var divisor = 100;
    var decoded = decodeFloatSplitList( deltasBigUint8, deltasSmallUint8, divisor, undefined, true );
    assert.equal( decoded.length, deltasBig.length/2 + deltasSmall.length, "Passed!" );
    assert.close( decoded[0], expected[0], 0.001, "Passed!" );
    assert.close( decoded[1], expected[1], 0.001, "Passed!" );
    assert.close( decoded[2], expected[2], 0.001, "Passed!" );
    assert.close( decoded[3], expected[3], 0.001, "Passed!" );
    assert.close( decoded[4], expected[4], 0.001, "Passed!" );
    assert.close( decoded[5], expected[5], 0.001, "Passed!" );
    assert.close( decoded[6], expected[6], 0.001, "Passed!" );
});

QUnit.test( "decodeFloatSplitList empty arrays", function( assert ) {
    var deltasBig = new Int32Array([]);
    var deltasSmall = new Int16Array([]);
    var expected = new Float32Array([]);
    var deltasBigUint8 = new Uint8Array( deltasBig.buffer );
    var deltasSmallUint8 = new Uint8Array( deltasSmall.buffer );
    var divisor = 100;
    var decoded = decodeFloatSplitList( deltasBigUint8, deltasSmallUint8, divisor, undefined, true );
    assert.equal( decoded.length, deltasBig.length/2 + deltasSmall.length, "Passed!" );
    assert.deepEqual( decoded, expected, "Passed!" );
});
