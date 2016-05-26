
///////////////////
// mmtf roundtrip
//
QUnit.module( "mmtf roundtrip" );

QUnit.test( "filled required decode-encode", function( assert ) {
    var input = getFilledRequiredMmtfDict();
    var output = encodeMmtf( decodeMmtf( input ) );
    assert.deepEqual( output, input, "Passed!" );
});

QUnit.test( "filled required encode-decode", function( assert ) {
    var input = getFilledRequiredDecodedMmtfDict();
    var output = decodeMmtf( encodeMmtf( input ) );
    assert.deepEqual( output, input, "Passed!" );
});


QUnit.test( "filled full decode-encode", function( assert ) {
    var input = getFilledFullMmtfDict();
    var output = encodeMmtf( decodeMmtf( input ) );
    assert.deepEqual( output, input, "Passed!" );
});

QUnit.test( "filled full encode-decode", function( assert ) {
    var input = getFilledFullDecodedMmtfDict();
    var output = decodeMmtf( encodeMmtf( input ) );
    assert.deepEqual( output, input, "Passed!" );
});


QUnit.test( "empty required decode-encode", function( assert ) {
    var input = getEmptyRequiredMmtfDict();
    var output = encodeMmtf( decodeMmtf( input ) );
    assert.deepEqual( output, input, "Passed!" );
});

QUnit.test( "empty required encode-decode", function( assert ) {
    var input = getEmptyRequiredDecodedMmtfDict();
    var output = decodeMmtf( encodeMmtf( input ) );
    assert.deepEqual( output, input, "Passed!" );
});


QUnit.test( "empty full decode-encode", function( assert ) {
    var input = getEmptyFullMmtfDict();
    var output = encodeMmtf( decodeMmtf( input ) );
    assert.deepEqual( output, input, "Passed!" );
});

QUnit.test( "empty full encode-decode", function( assert ) {
    var input = getEmptyFullDecodedMmtfDict();
    var output = decodeMmtf( encodeMmtf( input ) );
    assert.deepEqual( output, input, "Passed!" );
});
