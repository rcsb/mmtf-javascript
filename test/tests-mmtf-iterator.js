
//////////////////
// mmtf iterator
//
QUnit.module( "mmtf iterator" );

QUnit.test( "eachBond", function( assert ) {
    var dict = getFilledFullMmtfDict();
    var decodedMmtf = decodeMmtf( dict, { littleEndian: true } );
    var mmtfIterator = new MmtfIterator( decodedMmtf );
    var expected = [
        [ 0, 1, 2 ]
    ];
    var i = 0;
    mmtfIterator.eachBond( function(){
        var e = expected[ i ]
        assert.equal( arguments[ 0 ], e[ 0 ], "atom index 1 differs" );
        assert.equal( arguments[ 1 ], e[ 1 ], "atom index 2 differs" );
        assert.equal( arguments[ 2 ], e[ 2 ], "bond order differs" );
        i += 1;
    } );
});

QUnit.test( "eachAtom", function( assert ) {
    var dict = getFilledFullMmtfDict();
    var decodedMmtf = decodeMmtf( dict, { littleEndian: true } );
    var mmtfIterator = new MmtfIterator( decodedMmtf );
    var expected = [
        [ "C", "C", 2, 50, 60, 70, 99.99, 1, "A", 0.6 ],
        [ "N", "N", 1, 52, 63, 74, 100, 2, "B", 0.4 ]
    ];
    var i = 0;
    mmtfIterator.eachAtom( function(){
        var e = expected[ i ]
        assert.equal( arguments[ 0 ], e[ 0 ], "element differs" );
        assert.equal( arguments[ 1 ], e[ 1 ], "atom name differs" );
        assert.equal( arguments[ 2 ], e[ 2 ], "formal charge differs" );
        assert.close( arguments[ 3 ], e[ 3 ], 0.001, "x coord differs" );
        assert.close( arguments[ 4 ], e[ 4 ], 0.001, "y coord differs" );
        assert.close( arguments[ 5 ], e[ 5 ], 0.001, "z coord differs" );
        assert.close( arguments[ 6 ], e[ 6 ], 0.001, "b-factor differs" );
        assert.equal( arguments[ 7 ], e[ 7 ], "atom id differs" );
        assert.equal( arguments[ 8 ], e[ 8 ], "alternate location label differs" );
        assert.close( arguments[ 9 ], e[ 9 ], 0.001, "occupancy differs" );
        i += 1;
    } );
});

QUnit.test( "eachGroup", function( assert ) {
    var dict = getFilledFullMmtfDict();
    var decodedMmtf = decodeMmtf( dict, { littleEndian: true } );
    var mmtfIterator = new MmtfIterator( decodedMmtf );
    var expected = [
        [ "GLY", "G", "L-PEPTIDE LINKING", 100, 0, -1, "X", 0, 0, 2 ]
    ];
    var i = 0;
    mmtfIterator.eachGroup( function(){
        var e = expected[ i ]
        assert.equal( arguments[ 0 ], e[ 0 ], "group name differs" );
        assert.equal( arguments[ 1 ], e[ 1 ], "single letter code differs" );
        assert.equal( arguments[ 2 ], e[ 2 ], "chemical component type differs" );
        assert.equal( arguments[ 3 ], e[ 3 ], "group id differs" );
        assert.equal( arguments[ 4 ], e[ 4 ], "group type differs" );
        assert.equal( arguments[ 5 ], e[ 5 ], "secondary structure code differs" );
        assert.equal( arguments[ 6 ], e[ 6 ], "insertion code differs" );
        assert.equal( arguments[ 7 ], e[ 7 ], "sequence id differs" );
        assert.equal( arguments[ 8 ], e[ 8 ], "atom offset differs" );
        assert.equal( arguments[ 9 ], e[ 9 ], "atom count differs" );
        i += 1;
    } );
});

QUnit.test( "eachChain", function( assert ) {
    var dict = getFilledFullMmtfDict();
    var decodedMmtf = decodeMmtf( dict, { littleEndian: true } );
    var mmtfIterator = new MmtfIterator( decodedMmtf );
    var expected = [
        [ "DA","B", 0, 1 ]
    ];
    var i = 0;
    mmtfIterator.eachChain( function(){
        var e = expected[ i ]
        assert.equal( arguments[ 0 ], e[ 0 ], "chain id differs" );
        assert.equal( arguments[ 1 ], e[ 1 ], "chain name differs" );
        assert.equal( arguments[ 2 ], e[ 2 ], "group offset differs" );
        assert.equal( arguments[ 3 ], e[ 3 ], "group count differs" );
        i += 1;
    } );
});

QUnit.test( "eachModel", function( assert ) {
    var dict = getFilledFullMmtfDict();
    var decodedMmtf = decodeMmtf( dict, { littleEndian: true } );
    var mmtfIterator = new MmtfIterator( decodedMmtf );
    var expected = [
        [ 0, 1 ]
    ];
    var i = 0;
    mmtfIterator.eachModel( function(){
        var e = expected[ i ]
        assert.equal( arguments[ 2 ], e[ 2 ], "chain offset differs" );
        assert.equal( arguments[ 3 ], e[ 3 ], "chain count differs" );
        i += 1;
    } );
});
