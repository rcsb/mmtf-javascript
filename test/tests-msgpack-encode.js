
/////////////////////
// msgpack encoding
//
QUnit.module( "msgpack encoding" );

QUnit.test( "Positive FixInt", function( assert ) {
    var expected = new Uint8Array( [ 127 ] );
    var result = encodeMsgpack( 127 );
    assert.deepEqual( result, expected, "Passed!" );
});

QUnit.test( "FixMap", function( assert ) {
    var expected = new Uint8Array( 4 );
    var dv = new DataView( expected.buffer )
    dv.setUint8( 0, 0x80 + 1 );
    dv.setUint8( 1, 0xa0 + 1 );
    dv.setUint8( 2, 50 );
    dv.setUint8( 3, 3 );
    var result = encodeMsgpack( { "2": 3 } );
    assert.deepEqual( result, expected, "Passed!" );
});

QUnit.test( "FixArray", function( assert ) {
    var expected = new Uint8Array( 3 );
    var dv = new DataView( expected.buffer )
    dv.setUint8( 0, 0x90 + 2 );
    dv.setUint8( 1, 7 );
    dv.setUint8( 2, 5 );
    var result = encodeMsgpack( [ 7, 5 ] );
    assert.deepEqual( result, expected, "Passed!" );
});

QUnit.test( "FixStr", function( assert ) {
    var expected = new Uint8Array( 4 );
    var dv = new DataView( expected.buffer )
    dv.setUint8( 0, 0xa0 + 3 );
    dv.setUint8( 1, 65 );
    dv.setUint8( 2, 66 );
    dv.setUint8( 3, 67 );
    var result = encodeMsgpack( "ABC" );
    assert.deepEqual( result, expected, "Passed!" );
});

QUnit.test( "Negative FixInt", function( assert ) {
    var expected = new Uint8Array( new Int8Array( [ -31 ] ) );
    var result = encodeMsgpack( -31 );
    assert.deepEqual( result, expected, "Passed!" );
});

QUnit.test( "nil", function( assert ) {
    var expected = new Uint8Array( [ 0xc0 ] );
    var result = encodeMsgpack( null );
    assert.deepEqual( result, expected, "Passed!" );
});

QUnit.test( "undefined", function( assert ) {
    assert.throws( function(){ encodeMsgpack( undefined ) }, "Unknown type undefined" );
});

QUnit.test( "false", function( assert ) {
    var expected = new Uint8Array( [ 0xc2 ] );
    var result = encodeMsgpack( false );
    assert.deepEqual( result, expected, "Passed!" );
});

QUnit.test( "true", function( assert ) {
    var expected = new Uint8Array( [ 0xc3 ] );
    var result = encodeMsgpack( true );
    assert.deepEqual( result, expected, "Passed!" );
});

QUnit.test( "bin 8", function( assert ) {
    var expected = new Uint8Array( [ 0xc4, 2, 2, 3 ] );
    var data = new Uint8Array( [ 2, 3 ] );
    var result = encodeMsgpack( data.buffer );
    assert.deepEqual( result, expected, "Passed!" );
});

QUnit.test( "bin 16", function( assert ) {
    var len = 36000;
    var expected = new Uint8Array( len + 3 );
    var dv = new DataView( expected.buffer )
    dv.setUint8( 0, 0xc5 );
    dv.setInt16( 1, len, false );
    dv.setUint8( 3, 1, false );
    dv.setUint8( 4, 2, false );
    dv.setUint8( 5, 3, false );
    var data = new Uint8Array( len );
    data[ 0 ] = 1;
    data[ 1 ] = 2;
    data[ 2 ] = 3;
    var result = encodeMsgpack( data.buffer );
    assert.deepEqual( result, expected, "Passed!" );
});

QUnit.test( "bin 32", function( assert ) {
    var len = 106000;
    var expected = new Uint8Array( len + 5 );
    var dv = new DataView( expected.buffer )
    dv.setUint8( 0, 0xc6 );
    dv.setInt32( 1, len, false );
    dv.setUint8( 5, 4, false );
    dv.setUint8( 6, 5, false );
    dv.setUint8( 7, 6, false );
    var data = new Uint8Array( len );
    data[ 0 ] = 4;
    data[ 1 ] = 5;
    data[ 2 ] = 6;
    var result = encodeMsgpack( data.buffer );
    assert.deepEqual( result, expected, "Passed!" );
});

// ext 8

// ext 16

// ext 32

// float 32

QUnit.test( "float 64", function( assert ) {
    var value = 0x100000000 + 1.2;
    var expected = new Uint8Array( 9 );
    var dv = new DataView( expected.buffer )
    dv.setUint8( 0, 0xcb );
    dv.setFloat64( 1, value, false );
    var result = encodeMsgpack( value );
    assert.deepEqual( result, expected, "Passed!" );
});

QUnit.test( "uint 8", function( assert ) {
    var expected = new Uint8Array( 2 );
    var dv = new DataView( expected.buffer );
    dv.setUint8( 0, 0xcc );
    dv.setUint8( 1, 129, false );
    var result = encodeMsgpack( 129 );
    assert.deepEqual( result, expected, "Passed!" );
});

QUnit.test( "uint 16", function( assert ) {
    var expected = new Uint8Array( 3 );
    var dv = new DataView( expected.buffer );
    dv.setUint8( 0, 0xcd );
    dv.setUint16( 1, 1112, false );
    var result = encodeMsgpack( 1112 );
    assert.deepEqual( result, expected, "Passed!" );
});

QUnit.test( "uint 32", function( assert ) {
    var expected = new Uint8Array( 5 );
    var dv = new DataView( expected.buffer );
    dv.setUint8( 0, 0xce );
    dv.setUint32( 1, 91112, false );
    var result = encodeMsgpack( 91112 );
    assert.deepEqual( result, expected, "Passed!" );
});

QUnit.test( "uint too big", function( assert ) {
    assert.throws( function(){ encodeMsgpack( 0x100000000 + 1 ) }, "Number too big" );
});

QUnit.test( "int 8", function( assert ) {
    var expected = new Uint8Array( 2 );
    var dv = new DataView( expected.buffer );
    dv.setUint8( 0, 0xd0 );
    dv.setInt8( 1, -111, false );
    var result = encodeMsgpack( -111 );
    assert.deepEqual( result, expected, "Passed!" );
});

QUnit.test( "int 16", function( assert ) {
    var expected = new Uint8Array( 3 );
    var dv = new DataView( expected.buffer );
    dv.setUint8( 0, 0xd1 );
    dv.setInt16( 1, -1112, false );
    var result = encodeMsgpack( -1112 );
    assert.deepEqual( result, expected, "Passed!" );
});

QUnit.test( "int 32", function( assert ) {
    var expected = new Uint8Array( 5 );
    var dv = new DataView( expected.buffer );
    dv.setUint8( 0, 0xd2 );
    dv.setInt32( 1, -91112, false );
    var result = encodeMsgpack( -91112 );
    assert.deepEqual( result, expected, "Passed!" );
});

QUnit.test( "int too small", function( assert ) {
    assert.throws( function(){ encodeMsgpack( -0x80000000 - 1 ) }, "Number too small" );
});

QUnit.test( "NaN", function( assert ) {
    assert.throws( function(){ encodeMsgpack( NaN ) }, "Number not finite: NaN" );
});

QUnit.test( "+Infinity", function( assert ) {
    assert.throws( function(){ encodeMsgpack( +Infinity ) }, "Number not finite: Infinity" );
});

QUnit.test( "-Infinity", function( assert ) {
    assert.throws( function(){ encodeMsgpack( -Infinity ) }, "Number not finite: -Infinity" );
});

// uint 64

QUnit.test( "str 8", function( assert ) {
    var len = 32 + 1;
    var expected = new Uint8Array( len + 2 );
    var dv = new DataView( expected.buffer )
    dv.setUint8( 0, 0xd9 );
    dv.setInt8( 1, len, false );
    dv.setUint8( 2, "2".charCodeAt( 0 ), false );
    dv.setUint8( 3, "3".charCodeAt( 0 ), false );
    var zeroCharCode = "0".charCodeAt( 0 );
    for( var i = 2; i < len; ++i ){
        dv.setUint8( i + 2, zeroCharCode, false );
    }
    var data = new Uint8Array( len );
    data[ 0 ] = 2;
    data[ 1 ] = 3;
    var result = encodeMsgpack( data.join( "" ) );
    assert.deepEqual( result, expected, "Passed!" );
});

QUnit.test( "str 16", function( assert ) {
    var len = 256 + 1;
    var expected = new Uint8Array( len + 3 );
    var dv = new DataView( expected.buffer )
    dv.setUint8( 0, 0xda );
    dv.setInt16( 1, len, false );
    dv.setUint8( 3, "2".charCodeAt( 0 ), false );
    dv.setUint8( 4, "3".charCodeAt( 0 ), false );
    var zeroCharCode = "0".charCodeAt( 0 );
    for( var i = 2; i < len; ++i ){
        dv.setUint8( i + 3, zeroCharCode, false );
    }
    var data = new Uint8Array( len );
    data[ 0 ] = 2;
    data[ 1 ] = 3;
    var result = encodeMsgpack( data.join( "" ) );
    assert.deepEqual( result, expected, "Passed!" );
});

QUnit.test( "str 32", function( assert ) {
    var len = 65536 + 1;
    var expected = new Uint8Array( len + 5 );
    var dv = new DataView( expected.buffer )
    dv.setUint8( 0, 0xdb );
    dv.setInt32( 1, len, false );
    dv.setUint8( 5, "2".charCodeAt( 0 ), false );
    dv.setUint8( 6, "3".charCodeAt( 0 ), false );
    var zeroCharCode = "0".charCodeAt( 0 );
    for( var i = 2; i < len; ++i ){
        dv.setUint8( i + 5, zeroCharCode, false );
    }
    var data = new Uint8Array( len );
    data[ 0 ] = 2;
    data[ 1 ] = 3;
    var result = encodeMsgpack( data.join( "" ) );
    assert.deepEqual( result, expected, "Passed!" );
});

QUnit.test( "array 16", function( assert ) {
    var len = 256 + 1;
    var expected = new Uint8Array( len + 3 );
    var dv = new DataView( expected.buffer );
    dv.setUint8( 0, 0xdc );
    dv.setUint16( 1, len, false );
    dv.setUint8( 3, 0xc3 );
    var data = [];
    data[ 0 ] = true;
    for( var i = 1; i < len; ++i ){
        data[ i ] = 0;
    }
    var result = encodeMsgpack( data );
    assert.deepEqual( result, expected, "Passed!" );
});

QUnit.test( "array 32", function( assert ) {
    var len = 65536 + 1;
    var expected = new Uint8Array( len + 5 );
    var dv = new DataView( expected.buffer );
    dv.setUint8( 0, 0xdd );
    dv.setUint32( 1, len, false );
    dv.setUint8( 5, 0xc3 );
    var data = [];
    data[ 0 ] = true;
    for( var i = 1; i < len; ++i ){
        data[ i ] = 0;
    }
    var result = encodeMsgpack( data );
    assert.deepEqual( result, expected, "Passed!" );
});

QUnit.test( "unknown type in size calculation", function( assert ) {
    assert.throws( function(){ encodeMsgpack( new Array( 1 ) ) }, "Unknown type in size calculation" );
});

QUnit.test( "number too large in size calculation", function( assert ) {
    assert.throws( function(){ encodeMsgpack( 0x100000000 + 1 ) }, "number too large in size calculation" );
});

QUnit.test( "number too small in size calculation", function( assert ) {
    assert.throws( function(){ encodeMsgpack( -0x80000000 - 1 ) }, "number too small in size calculation" );
});

QUnit.test( "map 16", function( assert ) {
    var len = 256 + 1;
    var expected = new Uint8Array( 8 * len + 3 );
    var dv = new DataView( expected.buffer );
    dv.setUint8( 0, 0xde );
    dv.setUint16( 1, len, false );
    for( var i = 0; i < len; ++i ){
        var offset = 8 * i;
        var str = i.toString();
        str = ( "000" + str ).substring( str.length );
        dv.setUint8( offset + 3, 0xa0 + 3 );
        dv.setUint8( offset + 4, str.charCodeAt( 0 ) );
        dv.setUint8( offset + 5, str.charCodeAt( 1 ) );
        dv.setUint8( offset + 6, str.charCodeAt( 2 ) );
        dv.setUint8( offset + 7, 0xa0 + 3 );
        dv.setUint8( offset + 8, str.charCodeAt( 0 ) );
        dv.setUint8( offset + 9, str.charCodeAt( 1 ) );
        dv.setUint8( offset + 10, str.charCodeAt( 2 ) );
    }
    var data = {};
    for( var i = 0; i < len; ++i ){
        var str = i.toString();
        str = ( "000" + str ).substring( str.length );
        data[ str ] = str;
    }
    var result = encodeMsgpack( data );
    assert.deepEqual(
        decodeMsgpack( result ),
        decodeMsgpack( expected ),
        "Passed!"
    );
});

QUnit.test( "map 32", function( assert ) {
    var len = 65536 + 1;
    var expected = new Uint8Array( 12 * len + 5 );
    var dv = new DataView( expected.buffer );
    dv.setUint8( 0, 0xdf );
    dv.setUint32( 1, len, false );
    for( var i = 0; i < len; ++i ){
        var offset = 12 * i;
        var str = i.toString();
        str = ( "00000" + str ).substring( str.length );
        dv.setUint8( offset + 5, 0xa0 + 5 );
        dv.setUint8( offset + 6, str.charCodeAt( 0 ) );
        dv.setUint8( offset + 7, str.charCodeAt( 1 ) );
        dv.setUint8( offset + 8, str.charCodeAt( 2 ) );
        dv.setUint8( offset + 9, str.charCodeAt( 3 ) );
        dv.setUint8( offset + 10, str.charCodeAt( 4 ) );
        dv.setUint8( offset + 11, 0xa0 + 5 );
        dv.setUint8( offset + 12, str.charCodeAt( 0 ) );
        dv.setUint8( offset + 13, str.charCodeAt( 1 ) );
        dv.setUint8( offset + 14, str.charCodeAt( 2 ) );
        dv.setUint8( offset + 15, str.charCodeAt( 3 ) );
        dv.setUint8( offset + 16, str.charCodeAt( 4 ) );
    }
    var data = {};
    for( var i = 0; i < len; ++i ){
        var str = i.toString();
        str = ( "00000" + str ).substring( str.length );
        data[ str ] = str;
    }
    var result = encodeMsgpack( data );
    assert.deepEqual(
        decodeMsgpack( result ),
        decodeMsgpack( expected ),
        "Passed!"
    );
});
