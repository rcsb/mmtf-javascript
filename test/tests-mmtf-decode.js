
//////////////////
// mmtf decoding
//
QUnit.module( "mmtf decoding" );

QUnit.test( "empty full", function( assert ) {
    var dict = getEmptyFullMmtfDict();
    assert.equal( Object.keys( dict ).length, 39, "Wrong number of fields in msgpack" );
    checkMsgpack( dict, assert, true );
    var decodedMmtf = decodeMmtf( dict );
    checkMmtf( decodedMmtf, assert );
    var expectedMmtf = getEmptyFullDecodedMmtfDict();
    assert.deepEqual( decodedMmtf, expectedMmtf, "Passed!" );
});

QUnit.test( "empty required", function( assert ) {
    var dict = getEmptyRequiredMmtfDict();
    checkMsgpack( dict, assert, true );
    var decodedMmtf = decodeMmtf( dict );
    checkMmtf( decodedMmtf, assert );
    var expectedMmtf = getEmptyRequiredDecodedMmtfDict();
    assert.deepEqual( decodedMmtf, expectedMmtf, "Passed!" );
});

QUnit.test( "filled full", function( assert ) {
    var dict = getFilledFullMmtfDict();
    assert.equal( Object.keys( dict ).length, 39, "Wrong number of fields in msgpack" );
    checkMsgpack( dict, assert, true );
    var decodedMmtf = decodeMmtf( dict );
    checkMmtf( decodedMmtf, assert );
    var expectedMmtf = getFilledFullDecodedMmtfDict();
    assert.deepEqual( decodedMmtf, expectedMmtf, "Passed!" );
});

QUnit.test( "filled required", function( assert ) {
    var dict = getFilledRequiredMmtfDict();
    checkMsgpack( dict, assert, true );
    var decodedMmtf = decodeMmtf( dict );
    checkMmtf( decodedMmtf, assert );
    var expectedMmtf = getFilledRequiredDecodedMmtfDict();
    assert.deepEqual( decodedMmtf, expectedMmtf, "Passed!" );
});

QUnit.test( "empty required missing", function( assert ) {
    // not all throw an error with an empty mmtf dict, only tested with a filled mmtf dict
    var names = [
        // "groupList", "numBonds", "numAtoms",
        "xCoordBig", "xCoordSmall", "yCoordBig", "yCoordSmall", "zCoordBig", "zCoordSmall",
        "groupIdList", "groupTypeList", "chainIdList",
        // "groupsPerChain",
        "chainsPerModel"
    ];
    names.forEach( function( name ){
        var dict = getEmptyRequiredMmtfDict();
        delete dict[ name ];
        assert.throws( function(){ decodeMmtf( dict ) }, "TypeError " + name );
    } );
});
