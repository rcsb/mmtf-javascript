
//////////////////////////////
// decoding/encoding helpers
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
    var view = MmtfUtils.getInt8View( new Uint8Array( buffer ) );
    assert.equal( view[0], 12, "Passed!" );
    assert.equal( view[1], 0, "Passed!" );
    assert.equal( view[2], -4, "Passed!" );
});

QUnit.test( "getUint8View", function( assert ) {
    var buffer = new ArrayBuffer( 1 * 20 );
    var dv = new DataView( buffer );
    dv.setUint8( 0, 16 );
    dv.setUint8( 2, 5 );
    var view = MmtfUtils.getUint8View( new Uint8Array( buffer ) );
    assert.equal( view[0], 16, "Passed!" );
    assert.equal( view[1], 0, "Passed!" );
    assert.equal( view[2], 5, "Passed!" );
});

QUnit.test( "getInt16View", function( assert ) {
    var buffer = new ArrayBuffer( 1 * 10 );
    var dv = new DataView( buffer );
    dv.setInt16( 0, 16, true );
    dv.setInt16( 4, 5, true );
    var view = MmtfUtils.getInt16View( new Uint8Array( buffer ) );
    assert.equal( view[0], 16, "Passed!" );
    assert.equal( view[1], 0, "Passed!" );
    assert.equal( view[2], 5, "Passed!" );
});

QUnit.test( "getInt32View", function( assert ) {
    var buffer = new ArrayBuffer( 1 * 20 );
    var dv = new DataView( buffer );
    dv.setInt32( 0, 16, true );
    dv.setInt32( 8, 5, true );
    var view = MmtfUtils.getInt32View( new Uint8Array( buffer ) );
    assert.equal( view[0], 16, "Passed!" );
    assert.equal( view[1], 0, "Passed!" );
    assert.equal( view[2], 5, "Passed!" );
});

QUnit.test( "getFloat32View", function( assert ) {
    var buffer = new ArrayBuffer( 1 * 20 );
    var dv = new DataView( buffer );
    dv.setFloat32( 0, 16.1, true );
    dv.setFloat32( 8, 5.1, true );
    var view = MmtfUtils.getFloat32View( new Uint8Array( buffer ) );
    assert.close( view[0], 16.1, 0.001, "Passed!" );
    assert.close( view[1], 0.0, 0.001, "Passed!" );
    assert.close( view[2], 5.1, 0.001, "Passed!" );
});


QUnit.test( "decodeInt16", function( assert ) {
    var buffer = new ArrayBuffer( 2 * 20 );
    var dv = new DataView( buffer );
    dv.setInt16( 0, 18902 );
    dv.setInt16( 2 * 2, -4467 );
    var view2 = new Uint8Array( buffer, 0, 8 );
    var int16 = MmtfUtils.decodeInt16( view2 );
    assert.equal( int16[0], 18902, "Passed!" );
    assert.equal( int16[1], 0, "Passed!" );
    assert.equal( int16[2], -4467, "Passed!" );
});

QUnit.test( "encodeInt16", function( assert ) {
    var array = new Int16Array( [ 1, 2, 3 ] );
    var output = MmtfUtils.encodeInt16( array );
    var dv = new DataView( output.buffer );
    assert.equal( dv.getInt16( 0 ), 1, "Passed!" );
    assert.equal( dv.getInt16( 2 ), 2, "Passed!" );
    assert.equal( dv.getInt16( 4 ), 3, "Passed!" );
});

QUnit.test( "decodeInt32", function( assert ) {
    var buffer = new ArrayBuffer( 4 * 40 );
    var dv = new DataView( buffer );
    dv.setInt32( 0, 3418902 );
    dv.setInt32( 4 * 2, -743467 );
    var view2 = new Uint8Array( buffer, 0, 16 );
    var int32 = MmtfUtils.decodeInt32( view2 );
    assert.equal( int32[0], 3418902, "Passed!" );
    assert.equal( int32[1], 0, "Passed!" );
    assert.equal( int32[2], -743467, "Passed!" );
});

QUnit.test( "encodeInt32", function( assert ) {
    var array = new Int32Array( [ 1, 2, 3 ] );
    var output = MmtfUtils.encodeInt32( array );
    var dv = new DataView( output.buffer );
    assert.equal( dv.getInt32( 0 ), 1, "Passed!" );
    assert.equal( dv.getInt32( 4 ), 2, "Passed!" );
    assert.equal( dv.getInt32( 8 ), 3, "Passed!" );
});

QUnit.test( "decodeFloat32", function( assert ) {
    var buffer = new ArrayBuffer( 4 * 3 );
    var dv = new DataView( buffer );
    dv.setFloat32( 0, 3418.1 );
    dv.setFloat32( 4 * 2, -7437.2 );
    var view2 = new Uint8Array( buffer, 0, 4 * 3 );
    var float32 = MmtfUtils.decodeFloat32( view2 );
    assert.close( float32[0], 3418.1, 0.001, "Passed!" );
    assert.equal( float32[1], 0, "Passed!" );
    assert.close( float32[2], -7437.2, 0.001, "Passed!" );
});

QUnit.test( "encodeFloat32", function( assert ) {
    var array = new Float32Array( [ 1, 2, 3 ] );
    var output = MmtfUtils.encodeFloat32( array );
    var dv = new DataView( output.buffer );
    assert.close( dv.getFloat32( 0 ), 1, 0.001, "Passed!" );
    assert.close( dv.getFloat32( 4 ), 2, 0.001, "Passed!" );
    assert.close( dv.getFloat32( 8 ), 3, 0.001, "Passed!" );
});



QUnit.test( "decodeInteger", function( assert ) {
    var intArray = new Int32Array([
        12, 34, 543, 687, 2, 0, 4689
    ]);
    var expectedFloatArray = new Float32Array([
        0.12, 0.34, 5.43, 6.87, 0.02, 0.00, 46.89
    ]);
    var divisor = 100;
    var decodedFloatArray = MmtfUtils.decodeInteger( intArray, divisor );
    assert.deepEqual( decodedFloatArray, expectedFloatArray, "Passed!" );
});

QUnit.test( "decodeInteger empty array", function( assert ) {
    var intArray = new Int32Array([]);
    var expectedFloatArray = new Float32Array([]);
    var divisor = 100;
    var decodedFloatArray = MmtfUtils.decodeInteger( intArray, divisor );
    assert.deepEqual( decodedFloatArray, expectedFloatArray, "Passed!" );
});

QUnit.test( "encodeInteger", function( assert ) {
    var floatArray = new Float32Array([
        0.12, 0.34, 5.43, 6.87, 0.02, 0.00, 46.89
    ]);
    var expected = new Int32Array([
        12, 34, 543, 687, 2, 0, 4689
    ]);
    var factor = 100;
    var encoded = MmtfUtils.encodeInteger( floatArray, factor );
    assert.deepEqual( encoded, expected, "Passed!" );
});

QUnit.test( "encodeInteger int16", function( assert ) {
    var floatArray = new Float32Array([
        0.12, 0.34, 5.43, 6.87, 0.02, 0.00, 46.89
    ]);
    var expected = new Int16Array([
        12, 34, 543, 687, 2, 0, 4689
    ]);
    var output = new Int16Array( 7 );
    var factor = 100;
    var encoded = MmtfUtils.encodeInteger( floatArray, factor, output );
    assert.deepEqual( encoded, expected, "Passed!" );
});

QUnit.test( "encodeInteger int8", function( assert ) {
    var floatArray = new Float32Array([
        0.12, 0.34, 5.43, 6.71, 0.20, 0.01, 10.89
    ]);
    var expected = new Int8Array([
        1, 3, 54, 67, 2, 0, 109
    ]);
    var output = new Int8Array( 7 );
    var factor = 10;
    var encoded = MmtfUtils.encodeInteger( floatArray, factor, output );
    assert.deepEqual( encoded, expected, "Passed!" );
});



QUnit.test( "decodeRun", function( assert ) {
    var runs = new Int32Array([
        0, 2, 3, 5
    ]);
    var expected = new Int32Array([
        0, 0, 3, 3, 3, 3, 3
    ]);
    var decoded = MmtfUtils.decodeRun( runs );
    assert.equal( decoded.length, 7, "Passed!" );
    assert.deepEqual( decoded, expected, "Passed!" );
});

QUnit.test( "decodeRun single value", function( assert ) {
    var runs = new Int32Array([
        0, 1
    ]);
    var expected = new Int32Array([
        0
    ]);
    var decoded = MmtfUtils.decodeRun( runs );
    assert.equal( decoded.length, 1, "Passed!" );
    assert.deepEqual( decoded, expected, "Passed!" );
});

QUnit.test( "decodeRun empty array", function( assert ) {
    var runs = new Int32Array([]);
    var expected = new Int32Array([]);
    var decoded = MmtfUtils.decodeRun( runs );
    assert.equal( decoded.length, 0, "Passed!" );
    assert.deepEqual( decoded, expected, "Passed!" );
});

QUnit.test( "encodeRun", function( assert ) {
    var input = new Int32Array([
        0, 0, 10, 10, 10, 10, 3, 3, 3, 3, 3
    ]);
    var expected = new Int32Array([
        0, 2, 10, 4, 3, 5
    ]);
    var encoded = MmtfUtils.encodeRun( input );
    assert.deepEqual( encoded, expected, "Passed!" );
});

QUnit.test( "encodeRun single value", function( assert ) {
    var input = new Int32Array([
        100
    ]);
    var expected = new Int32Array([
        100, 1
    ]);
    var encoded = MmtfUtils.encodeRun( input );
    assert.deepEqual( encoded, expected, "Passed!" );
});

QUnit.test( "encodeRun empty input", function( assert ) {
    var input = new Int32Array([]);
    var expected = new Int32Array([]);
    var encoded = MmtfUtils.encodeRun( input );
    assert.deepEqual( encoded, expected, "Passed!" );
});



QUnit.test( "decodeDelta", function( assert ) {
    var input = new Int32Array([
        -2, 4, 1, 2, 1, 1, -4, -2, 9
    ]);
    var expected = new Int32Array([
        -2, 2, 3, 5, 6, 7, 3, 1, 10
    ]);
    var decoded = MmtfUtils.decodeDelta( input );
    assert.equal( decoded.length, expected.length, "Passed!" );
    assert.deepEqual( decoded, expected, "Passed!" );
});

QUnit.test( "decodeDelta empty array", function( assert ) {
    var deltas = new Int32Array([]);
    var expected = new Int32Array([]);
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



QUnit.test( "decodePacking", function( assert ) {
    var input = new Int16Array([
        0x7FFF, 0, 0x7FFF, 1, 0x7FFF - 1,
        -0x7FFF - 1, 0, -0x7FFF - 1, -1, -0x7FFF
    ]);
    var expected = new Int32Array([
        0x7FFF, 0x7FFF + 1, 0x7FFF - 1,
        -0x7FFF - 1, -0x7FFF - 2, -0x7FFF
    ]);
    var decoded = MmtfUtils.decodePacking( input );
    assert.deepEqual( decoded, expected, "Passed!" );
});

QUnit.test( "encodePacking", function( assert ) {
    var input = new Int32Array([
        0x7FFF, 0x7FFF + 1, 0x7FFF - 1,
        -0x7FFF - 1, -0x7FFF - 2, -0x7FFF, 0
    ]);
    var expected = new Int16Array([
        0x7FFF, 0, 0x7FFF, 1, 0x7FFF - 1,
        -0x7FFF - 1, 0, -0x7FFF - 1, -1, -0x7FFF, 0
    ]);
    var encoded = MmtfUtils.encodePacking( input );
    assert.deepEqual( encoded, expected, "Passed!" );
});



QUnit.test( "decodeDeltaRun", function( assert ) {
    var input = new Int32Array([
        1, 5
    ]);
    var expected = new Int32Array([
        1, 2, 3, 4, 5
    ]);
    var decoded = MmtfUtils.decodeDeltaRun( input );
    assert.equal( decoded.length, expected.length, "Passed!" );
    assert.deepEqual( decoded, expected, "Passed!" );
});

QUnit.test( "encodeDeltaRun", function( assert ) {
    var input = new Int32Array([
        1, 2, 3, 4, 5
    ]);
    var expected = new Int32Array([
        1, 5
    ]);
    var encoded = MmtfUtils.encodeDeltaRun( input );
    assert.equal( encoded.length, expected.length, "Passed!" );
    assert.deepEqual( encoded, expected, "Passed!" );
});



QUnit.test( "decodeIntegerRun", function( assert ) {
    var input = new Int32Array([
        320, 3, 100, 2
    ]);
    var expected = new Float32Array([
        3.20, 3.20, 3.20, 1.00, 1.00
    ]);
    var divisor = 100;
    var decoded = MmtfUtils.decodeIntegerRun( input, divisor );
    assert.equal( decoded.length, expected.length, "Passed!" );
    assert.close( decoded[0], expected[0], 0.001, "Passed!" );
    assert.close( decoded[1], expected[1], 0.001, "Passed!" );
    assert.close( decoded[2], expected[2], 0.001, "Passed!" );
    assert.close( decoded[3], expected[3], 0.001, "Passed!" );
    assert.close( decoded[4], expected[4], 0.001, "Passed!" );
});

QUnit.test( "decodeIntegerRun empty arrays", function( assert ) {
    var input = new Int32Array([]);
    var expected = new Float32Array([]);
    var divisor = 100;
    var decoded = MmtfUtils.decodeIntegerRun( input, divisor );
    assert.equal( decoded.length, expected.length, "Passed!" );
    assert.deepEqual( decoded, expected, "Passed!" );
});

QUnit.test( "encodeIntegerRun", function( assert ) {
    var floatInput = new Float32Array([
        3.20, 3.20, 3.20, 1.00, 1.00
    ]);
    var expected = new Int32Array([
        320, 3, 100, 2
    ]);
    var divisor = 100;
    var encoded = MmtfUtils.encodeIntegerRun( floatInput, divisor );
    assert.equal( encoded.length, expected.length, "Passed!" );
    assert.deepEqual( encoded, expected, "Passed!" );
});

QUnit.test( "encodeIntegerRun empty array", function( assert ) {
    var floatInput = new Float32Array([]);
    var expected = new Int32Array([]);
    var divisor = 100;
    var encoded = MmtfUtils.encodeIntegerRun( floatInput, divisor );
    assert.deepEqual( encoded, expected, "Passed!" );
});



QUnit.test( "decodeIntegerDelta", function( assert ) {
    var input = new Int32Array([
        -20, 40, 10, 20, 10, 10, -40, -20, 90
    ]);
    var expected = new Float32Array([
        -2, 2, 3, 5, 6, 7, 3, 1, 10
    ]);
    var decoded = MmtfUtils.decodeIntegerDelta( input, 10 );
    assert.equal( decoded.length, expected.length, "Passed!" );
    assert.deepEqual( decoded, expected, "Passed!" );
});

QUnit.test( "encodeIntegerDelta", function( assert ) {
    var input = new Float32Array([
        -2, 2, 3, 5, 6, 7, 3, 1, 10
    ]);
    var expected = new Int32Array([
        -20, 40, 10, 20, 10, 10, -40, -20, 90
    ]);
    var encoded = MmtfUtils.encodeIntegerDelta( input, 10 );
    assert.equal( encoded.length, expected.length, "Passed!" );
    assert.deepEqual( encoded, expected, "Passed!" );
});



QUnit.test( "decodeIntegerPacking", function( assert ) {
    var input = new Int32Array([
        -20, 40, 10, 20, 10, 10, -40, -20, 90
    ]);
    var expected = new Float32Array([
        -2, 4, 1, 2, 1, 1, -4, -2, 9
    ]);
    var decoded = MmtfUtils.decodeIntegerPacking( input, 10 );
    assert.equal( decoded.length, expected.length, "Passed!" );
    assert.deepEqual( decoded, expected, "Passed!" );
});

QUnit.test( "encodeIntegerPacking", function( assert ) {
    var input = new Float32Array([
        -2, 4, 1, 2, 1, 1, -4, -2, 9
    ]);
    var expected = new Int16Array([
        -20, 40, 10, 20, 10, 10, -40, -20, 90
    ]);
    var encoded = MmtfUtils.encodeIntegerPacking( input, 10 );
    assert.equal( encoded.length, expected.length, "Passed!" );
    assert.deepEqual( encoded, expected, "Passed!" );
});



QUnit.test( "decodeIntegerDeltaPacking", function( assert ) {
    var input = new Int16Array([
        1212, 89, 13789  // deltas from 1212, 1301, 15090
    ]);
    var expected = new Float32Array([
        12.12, 13.01, 150.90
    ]);
    var divisor = 100;
    var decoded = MmtfUtils.decodeIntegerDeltaPacking( input, divisor );
    assert.deepEqual( decoded, expected, "Passed!" );
});

QUnit.test( "encodeIntegerDeltaPacking", function( assert ) {
    var input = new Float32Array([
        12.12, 13.01, 150.90
    ]);
    var expected = new Int16Array([
        1212, 89, 13789  // deltas from 1212, 1301, 15090
    ]);
    var divisor = 100;
    var decoded = MmtfUtils.encodeIntegerDeltaPacking( input, divisor );
    assert.deepEqual( decoded, expected, "Passed!" );
});



QUnit.test( "decodeBytes", function( assert ) {
    var buffer = new ArrayBuffer( 1 * 13 );
    var dv = new DataView( buffer );
    dv.setInt32( 0, 16 );    // type
    dv.setInt32( 4, 1 );     // size
    dv.setUint8( 11, 6 );    // param
    dv.setUint8( 12, 100 );  // data
    var info = MmtfUtils.decodeBytes( new Uint8Array( buffer ) );
    assert.equal( info[0], 16, "Passed!" );
    assert.equal( info[1][0], 100, "Passed!" );
    assert.equal( info[2], 1, "Passed!" );
    assert.equal( info[3][3], 6, "Passed!" );
});

QUnit.test( "encodeBytes", function( assert ) {
    var buffer = new ArrayBuffer( 1 * 13 );
    var dv = new DataView( buffer );
    dv.setInt32( 0, 16 );    // type
    dv.setInt32( 4, 1 );     // size
    dv.setUint8( 11, 6 );    // param
    dv.setUint8( 12, 100 );  // data
    var expected = new Uint8Array( buffer );
    var bytes = new Uint8Array( MmtfUtils.encodeBytes(
        16, 1, new Uint8Array([ 0, 0, 0, 6 ]), new Uint8Array([ 100 ])
    ) );
    assert.deepEqual( bytes, expected );
});
