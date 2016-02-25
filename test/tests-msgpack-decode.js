
/////////////////////
// msgpack decoding
//
QUnit.module( "msgpack decoding" );

QUnit.test( "Positive FixInt", function( assert ) {
    var buffer = new Uint8Array( [ 127 ] );
    var result = decodeMsgpack( buffer );
    assert.equal( result, 127, "Passed!" );
});

QUnit.test( "FixMap", function( assert ) {
    var buffer = new Uint8Array( 3 );
    var dv = new DataView( buffer.buffer )
    dv.setUint8( 0, 0x80 + 1 );
    dv.setUint8( 1, 2 );
    dv.setUint8( 2, 3 );
    var result = decodeMsgpack( buffer );
    assert.deepEqual( result, { "2": 3 }, "Passed!" );
});

QUnit.test( "FixArray", function( assert ) {
    var buffer = new Uint8Array( 3 );
    var dv = new DataView( buffer.buffer )
    dv.setUint8( 0, 0x90 + 2 );
    dv.setUint8( 1, 7 );
    dv.setUint8( 2, 5 );
    var result = decodeMsgpack( buffer );
    assert.deepEqual( result, [ 7, 5 ], "Passed!" );
});

QUnit.test( "FixStr", function( assert ) {
    var buffer = new Uint8Array( 4 );
    var dv = new DataView( buffer.buffer )
    dv.setUint8( 0, 0xa0 + 3 );
    dv.setUint8( 1, 65 );
    dv.setUint8( 2, 66 );
    dv.setUint8( 3, 67 );
    var result = decodeMsgpack( buffer );
    assert.deepEqual( result, "ABC", "Passed!" );
});

QUnit.test( "Negative FixInt", function( assert ) {
    var buffer = new Int8Array( [ -31 ] );
    var result = decodeMsgpack( buffer );
    assert.equal( result, -31, "Passed!" );
});

QUnit.test( "nil", function( assert ) {
    var buffer = new Uint8Array( [ 0xc0 ] );
    var result = decodeMsgpack( buffer );
    assert.equal( result, null, "Passed!" );
});

QUnit.test( "(ununsed)", function( assert ) {
    var buffer = new Uint8Array( [ 0xc1 ] );
    assert.throws( function(){ decodeMsgpack( buffer ) }, "Unknown type 0xc1" );
});

QUnit.test( "false", function( assert ) {
    var buffer = new Uint8Array( [ 0xc2 ] );
    var result = decodeMsgpack( buffer );
    assert.equal( result, false, "Passed!" );
});

QUnit.test( "true", function( assert ) {
    var buffer = new Uint8Array( [ 0xc3 ] );
    var result = decodeMsgpack( buffer );
    assert.equal( result, true, "Passed!" );
});

QUnit.test( "bin 8", function( assert ) {
    var buffer = new Uint8Array( [ 0xc4, 2, 2, 3 ] );
    var result = decodeMsgpack( buffer );
    assert.equal( result[ 0 ], 2, "Passed!" );
    assert.equal( result[ 1 ], 3, "Passed!" );
});

QUnit.test( "bin 16", function( assert ) {
    var buffer = new Uint8Array( 6 );
    var dv = new DataView( buffer.buffer )
    dv.setUint8( 0, 0xc5 );
    dv.setInt16( 1, 3, false );
    dv.setUint8( 3, 1, false );
    dv.setUint8( 4, 2, false );
    dv.setUint8( 5, 3, false );
    var result = decodeMsgpack( buffer );
    assert.equal( result[ 0 ], 1, "Passed!" );
    assert.equal( result[ 1 ], 2, "Passed!" );
    assert.equal( result[ 2 ], 3, "Passed!" );
});

QUnit.test( "bin 32", function( assert ) {
    var buffer = new Uint8Array( 8 );
    var dv = new DataView( buffer.buffer )
    dv.setUint8( 0, 0xc6 );
    dv.setInt32( 1, 3, false );
    dv.setUint8( 5, 1, false );
    dv.setUint8( 6, 2, false );
    dv.setUint8( 7, 3, false );
    var result = decodeMsgpack( buffer );
    assert.equal( result[ 0 ], 1, "Passed!" );
    assert.equal( result[ 1 ], 2, "Passed!" );
    assert.equal( result[ 2 ], 3, "Passed!" );
});

QUnit.test( "ext 8", function( assert ) {
    var buffer = new Uint8Array( [ 0xc7, 1, 10, 3 ] );
    var result = decodeMsgpack( buffer );
    assert.equal( result[ 0 ], 10, "Passed!" );
    assert.equal( result[ 1 ][ 0 ], 3, "Passed!" );
});

QUnit.test( "ext 16", function( assert ) {
    var buffer = new Uint8Array( 7 );
    var dv = new DataView( buffer.buffer )
    dv.setUint8( 0, 0xc8 );
    dv.setInt16( 1, 2, false );
    dv.setUint8( 3, 10, false );
    dv.setUint8( 4, 2, false );
    dv.setUint8( 5, 3, false );
    var result = decodeMsgpack( buffer );
    assert.equal( result[ 0 ], 10, "Passed!" );
    assert.equal( result[ 1 ][ 0 ], 2, "Passed!" );
    assert.equal( result[ 1 ][ 1 ], 3, "Passed!" );
});

QUnit.test( "ext 32", function( assert ) {
    var buffer = new Uint8Array( 9 );
    var dv = new DataView( buffer.buffer )
    dv.setUint8( 0, 0xc9 );
    dv.setInt32( 1, 2, false );
    dv.setUint8( 5, 10, false );
    dv.setUint8( 6, 2, false );
    dv.setUint8( 7, 3, false );
    var result = decodeMsgpack( buffer );
    assert.equal( result[ 0 ], 10, "Passed!" );
    assert.equal( result[ 1 ][ 0 ], 2, "Passed!" );
    assert.equal( result[ 1 ][ 1 ], 3, "Passed!" );
});

QUnit.test( "float 32", function( assert ) {
    var buffer = new Uint8Array( 5 );
    var dv = new DataView( buffer.buffer )
    dv.setUint8( 0, 0xca );
    dv.setFloat32( 1, 1.23, false );
    var result = decodeMsgpack( buffer );
    assert.close( result, 1.23, 0.001, "Passed!" );
});

QUnit.test( "float 64", function( assert ) {
    var buffer = new Uint8Array( 9 );
    var dv = new DataView( buffer.buffer )
    dv.setUint8( 0, 0xcb );
    dv.setFloat64( 1, 5.23, false );
    var result = decodeMsgpack( buffer );
    assert.close( result, 5.23, 0.001, "Passed!" );
});

QUnit.test( "uint 8", function( assert ) {
    var buffer = new Uint8Array( 2 );
    var dv = new DataView( buffer.buffer )
    dv.setUint8( 0, 0xcc );
    dv.setUint8( 1, 111, false );
    var result = decodeMsgpack( buffer );
    assert.equal( result, 111, "Passed!" );
});

QUnit.test( "uint 16", function( assert ) {
    var buffer = new Uint8Array( 3 );
    var dv = new DataView( buffer.buffer )
    dv.setUint8( 0, 0xcd );
    dv.setUint16( 1, 1112, false );
    var result = decodeMsgpack( buffer );
    assert.equal( result, 1112, "Passed!" );
});

QUnit.test( "uint 32", function( assert ) {
    var buffer = new Uint8Array( 5 );
    var dv = new DataView( buffer.buffer )
    dv.setUint8( 0, 0xce );
    dv.setUint32( 1, 91112, false );
    var result = decodeMsgpack( buffer );
    assert.equal( result, 91112, "Passed!" );
});

QUnit.test( "uint 64", function( assert ) {
    var buffer = new Uint8Array( 9 );
    var dv = new DataView( buffer.buffer )
    dv.setUint8( 0, 0xcf );
    var result = decodeMsgpack( buffer );
    assert.equal( result, 0, "Passed!" );
});

QUnit.test( "int 8", function( assert ) {
    var buffer = new Uint8Array( 2 );
    var dv = new DataView( buffer.buffer )
    dv.setUint8( 0, 0xd0 );
    dv.setInt8( 1, -111, false );
    var result = decodeMsgpack( buffer );
    assert.equal( result, -111, "Passed!" );
});

QUnit.test( "int 16", function( assert ) {
    var buffer = new Uint8Array( 3 );
    var dv = new DataView( buffer.buffer )
    dv.setUint8( 0, 0xd1 );
    dv.setInt16( 1, -1112, false );
    var result = decodeMsgpack( buffer );
    assert.equal( result, -1112, "Passed!" );
});

QUnit.test( "int 32", function( assert ) {
    var buffer = new Uint8Array( 5 );
    var dv = new DataView( buffer.buffer )
    dv.setUint8( 0, 0xd2 );
    dv.setInt32( 1, -91112, false );
    var result = decodeMsgpack( buffer );
    assert.equal( result, -91112, "Passed!" );
});

QUnit.test( "int 64", function( assert ) {
    var buffer = new Uint8Array( 9 );
    var dv = new DataView( buffer.buffer )
    dv.setUint8( 0, 0xd3 );
    var result = decodeMsgpack( buffer );
    assert.equal( result, 0, "Passed!" );
});

QUnit.test( "fixext 1", function( assert ) {
    var buffer = new Uint8Array( 3 );
    var dv = new DataView( buffer.buffer )
    dv.setUint8( 0, 0xd4 );
    dv.setUint8( 1, 10 );
    dv.setUint8( 2, 1 );
    var result = decodeMsgpack( buffer );
    assert.equal( result[ 0 ], 10, "Passed!" );
    assert.equal( result[ 1 ][ 0 ], 1, "Passed!" );
});

QUnit.test( "fixext 2", function( assert ) {
    var buffer = new Uint8Array( 4 );
    var dv = new DataView( buffer.buffer )
    dv.setUint8( 0, 0xd5 );
    dv.setUint8( 1, 10 );
    dv.setUint8( 2, 1 );
    dv.setUint8( 3, 2 );
    var result = decodeMsgpack( buffer );
    assert.equal( result[ 0 ], 10, "Passed!" );
    assert.equal( result[ 1 ][ 0 ], 1, "Passed!" );
    assert.equal( result[ 1 ][ 1 ], 2, "Passed!" );
});

QUnit.test( "fixext 4", function( assert ) {
    var buffer = new Uint8Array( 6 );
    var dv = new DataView( buffer.buffer )
    dv.setUint8( 0, 0xd6 );
    dv.setUint8( 1, 10 );
    dv.setUint8( 2, 1 );
    dv.setUint8( 3, 2 );
    dv.setUint8( 4, 3 );
    dv.setUint8( 5, 4 );
    var result = decodeMsgpack( buffer );
    assert.equal( result[ 0 ], 10, "Passed!" );
    assert.equal( result[ 1 ][ 0 ], 1, "Passed!" );
    assert.equal( result[ 1 ][ 1 ], 2, "Passed!" );
    assert.equal( result[ 1 ][ 2 ], 3, "Passed!" );
    assert.equal( result[ 1 ][ 3 ], 4, "Passed!" );
});

QUnit.test( "fixext 8", function( assert ) {
    var buffer = new Uint8Array( 10 );
    var dv = new DataView( buffer.buffer )
    dv.setUint8( 0, 0xd7 );
    dv.setUint8( 1, 10 );
    dv.setUint8( 2, 1 );
    dv.setUint8( 3, 2 );
    dv.setUint8( 4, 3 );
    dv.setUint8( 5, 4 );
    dv.setUint8( 9, 99 );
    var result = decodeMsgpack( buffer );
    assert.equal( result[ 0 ], 10, "Passed!" );
    assert.equal( result[ 1 ][ 0 ], 1, "Passed!" );
    assert.equal( result[ 1 ][ 1 ], 2, "Passed!" );
    assert.equal( result[ 1 ][ 2 ], 3, "Passed!" );
    assert.equal( result[ 1 ][ 3 ], 4, "Passed!" );
    assert.equal( result[ 1 ][ 7 ], 99, "Passed!" );
});

QUnit.test( "fixext 16", function( assert ) {
    var buffer = new Uint8Array( 18 );
    var dv = new DataView( buffer.buffer )
    dv.setUint8( 0, 0xd8 );
    dv.setUint8( 1, 10 );
    dv.setUint8( 2, 1 );
    dv.setUint8( 3, 2 );
    dv.setUint8( 4, 3 );
    dv.setUint8( 5, 4 );
    dv.setUint8( 9, 99 );
    dv.setUint8( 17, 199 );
    var result = decodeMsgpack( buffer );
    assert.equal( result[ 0 ], 10, "Passed!" );
    assert.equal( result[ 1 ][ 0 ], 1, "Passed!" );
    assert.equal( result[ 1 ][ 1 ], 2, "Passed!" );
    assert.equal( result[ 1 ][ 2 ], 3, "Passed!" );
    assert.equal( result[ 1 ][ 3 ], 4, "Passed!" );
    assert.equal( result[ 1 ][ 7 ], 99, "Passed!" );
    assert.equal( result[ 1 ][ 15 ], 199, "Passed!" );
});

QUnit.test( "str 8", function( assert ) {
    var buffer = new Uint8Array( [ 0xd9, 2, 65, 66 ] );
    var result = decodeMsgpack( buffer );
    assert.equal( result, "AB", "Passed!" );
});

QUnit.test( "str 16", function( assert ) {
    var buffer = new Uint8Array( 4 );
    var dv = new DataView( buffer.buffer )
    dv.setUint8( 0, 0xda );
    dv.setUint16( 1, 1, false );
    dv.setUint8( 3, 65 );
    var result = decodeMsgpack( buffer );
    assert.equal( result, "A", "Passed!" );
});

QUnit.test( "str 32", function( assert ) {
    var buffer = new Uint8Array( 8 );
    var dv = new DataView( buffer.buffer )
    dv.setUint8( 0, 0xdb );
    dv.setUint32( 1, 1, false );
    dv.setUint8( 5, 65 );
    var result = decodeMsgpack( buffer );
    assert.equal( result, "A", "Passed!" );
});

QUnit.test( "array 16", function( assert ) {
    var buffer = new Uint8Array( 4 );
    var dv = new DataView( buffer.buffer )
    dv.setUint8( 0, 0xdc );
    dv.setUint16( 1, 1, false );
    dv.setUint8( 3, 0xc3 );
    var result = decodeMsgpack( buffer );
    assert.deepEqual( result, [ true ], "Passed!" );
});

QUnit.test( "array 32", function( assert ) {
    var buffer = new Uint8Array( 8 );
    var dv = new DataView( buffer.buffer )
    dv.setUint8( 0, 0xdd );
    dv.setUint32( 1, 1, false );
    dv.setUint8( 5, 0xc3 );
    var result = decodeMsgpack( buffer );
    assert.deepEqual( result, [ true ], "Passed!" );
});

QUnit.test( "map 16", function( assert ) {
    var buffer = new Uint8Array( 5 );
    var dv = new DataView( buffer.buffer )
    dv.setUint8( 0, 0xde );
    dv.setUint16( 1, 1, false );
    dv.setUint8( 3, 2 );
    dv.setUint8( 4, 3 );
    var result = decodeMsgpack( buffer );
    assert.deepEqual( result, { "2": 3 }, "Passed!" );
});

QUnit.test( "map 32", function( assert ) {
    var buffer = new Uint8Array( 7 );
    var dv = new DataView( buffer.buffer )
    dv.setUint8( 0, 0xdf );
    dv.setUint32( 1, 1, false );
    dv.setUint8( 5, 2 );
    dv.setUint8( 6, 3 );
    var result = decodeMsgpack( buffer );
    assert.deepEqual( result, { "2": 3 }, "Passed!" );
});
