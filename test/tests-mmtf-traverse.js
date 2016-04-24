
//////////////////
// mmtf iterator
//
QUnit.module( "mmtf traversal" );

QUnit.test( "onBond", function( assert ) {
    var dict = getFilledFullMmtfDict();
    var decodedMmtf = decodeMmtf( dict );
    var expected = [
        { atomIndex1: 0, atomIndex2: 1, bondOrder: 2 },
        { atomIndex1: 0, atomIndex2: 1, bondOrder: 2 },
        { atomIndex1: 0, atomIndex2: 0, bondOrder: 0 }
    ];
    var i = 0;
    var onBond = function( bondData ){
        var e = expected[ i ];
        assert.deepEqual( bondData, expected[ i ], "bondData differs" );
        i += 1;
    };
    traverseMmtf( decodedMmtf, { onBond: onBond } );
});

QUnit.test( "eachAtom", function( assert ) {
    var dict = getFilledFullMmtfDict();
    var decodedMmtf = decodeMmtf( dict );
    var expected = [
        {
            atomIndex: 0,
            groupIndex: 0,
            chainIndex: 0,
            modelIndex: 0,
            element: "C",
            atomName: "C",
            atomCharge: 2,
            xCoord: 50,
            yCoord: 60,
            zCoord: 70,
            bFactor: 99.98999786376953,
            atomId: 1,
            altLoc: "A",
            occupancy: 0.6000000238418579
        },
        {
            atomIndex: 1,
            groupIndex: 0,
            chainIndex: 0,
            modelIndex: 0,
            element: "N",
            atomName: "N",
            atomCharge: 1,
            xCoord: 52,
            yCoord: 63,
            zCoord: 74,
            bFactor: 100,
            atomId: 2,
            altLoc: "B",
            occupancy: 0.4000000059604645
        }
    ];
    var i = 0;
    var onAtom = function( atomData ){
        assert.deepEqual( atomData, expected[ i ], "atomData differs" );
        i += 1;
    };
    traverseMmtf( decodedMmtf, { onAtom: onAtom } );
});

QUnit.test( "eachGroup", function( assert ) {
    var dict = getFilledFullMmtfDict();
    var decodedMmtf = decodeMmtf( dict );
    var expected = [
        {
            atomCount: 2,
            groupIndex: 0,
            chainIndex: 0,
            modelIndex: 0,
            groupName: "GLY",
            singleLetterCode: "G",
            chemCompType: "L-PEPTIDE LINKING",
            groupId: 100,
            groupType: 0,
            secStruct: -1,
            insCode: "X",
            sequenceIndex: 0
        }
    ];
    var i = 0;
    var onGroup = function( groupData ){
        assert.deepEqual( groupData, expected[ i ], "groupData differs" );
        i += 1;
    };
    traverseMmtf( decodedMmtf, { onGroup: onGroup } );
});

QUnit.test( "eachChain", function( assert ) {
    var dict = getFilledFullMmtfDict();
    var decodedMmtf = decodeMmtf( dict );
    var expected = [
        {
            groupCount: 1,
            chainIndex: 0,
            modelIndex: 0,
            chainId: "DA",
            chainName: "B"
        }
    ];
    var i = 0;
    var onChain = function( chainData ){
        assert.deepEqual( chainData, expected[ i ], "chainData differs" );
        i += 1;
    };
    traverseMmtf( decodedMmtf, { onChain: onChain } );
});

QUnit.test( "eachModel", function( assert ) {
    var dict = getFilledFullMmtfDict();
    var decodedMmtf = decodeMmtf( dict );
    var expected = [
        {
            chainCount: 1,
            modelIndex: 0
        }
    ];
    var i = 0;
    var onModel = function( modelData ){
        assert.deepEqual( modelData, expected[ i ], "modelData differs" );
        i += 1;
    };
    traverseMmtf( decodedMmtf, { onModel: onModel } );
});
