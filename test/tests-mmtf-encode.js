
//////////////////
// mmtf encoding
//
QUnit.module( "mmtf encoding" );

QUnit.test( "filled required", function( assert ) {
    var inputDict = getFilledRequiredDecodedMmtfDict();
    var expected = getFilledRequiredMmtfDict();
    var encodedMmtf = encodeMmtf( inputDict );
    checkMsgpack( encodedMmtf, assert );
    assert.deepEqual( encodedMmtf, expected, "Passed!" );
});


QUnit.test( "filled full", function( assert ) {
    var inputDict = getFilledFullDecodedMmtfDict();
    var expected = getFilledFullMmtfDict();
    var encodedMmtf = encodeMmtf( inputDict );
    checkMsgpack( encodedMmtf, assert );
    assert.deepEqual( encodedMmtf, expected, "Passed!" );
});
