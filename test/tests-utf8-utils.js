
/////////////////////
// utf8 helpers
//
QUnit.module( "utf8 utils" );

QUnit.test( "utf8ByteCount one byte", function( assert ) {
    var str = "Hello";
    var byteCount = Utf8Utils.utf8ByteCount( str );
    assert.equal( byteCount, 5, "Passed!" );
    assert.equal( str.length, 5, "Passed!" );
});

QUnit.test( "utf8ByteCount two byte", function( assert ) {
    var str = "¢";
    var byteCount = Utf8Utils.utf8ByteCount( str );
    assert.equal( byteCount, 2, "Passed!" );
    assert.equal( str.length, 1, "Passed!" );
});

QUnit.test( "utf8ByteCount three byte", function( assert ) {
    var str = "𠜎";
    var byteCount = Utf8Utils.utf8ByteCount( str );
    assert.equal( byteCount, 6, "Passed!" );
    assert.equal( str.length, 2, "Passed!" );
});

QUnit.test( "utf8ByteCount three byte", function( assert ) {
    var str = "€";
    var byteCount = Utf8Utils.utf8ByteCount( str );
    assert.equal( byteCount, 3, "Passed!" );
    assert.equal( str.length, 1, "Passed!" );
});

QUnit.test( "utf8ByteCount three byte", function( assert ) {
    var str = "ℬ";
    var byteCount = Utf8Utils.utf8ByteCount( str );
    assert.equal( byteCount, 3, "Passed!" );
    assert.equal( str.length, 1, "Passed!" );
});

QUnit.test( "utf8ByteCount three byte", function( assert ) {
    var str = "𐍈";
    var byteCount = Utf8Utils.utf8ByteCount( str );
    assert.equal( byteCount, 6, "Passed!" );
    assert.equal( str.length, 2, "Passed!" );
});
