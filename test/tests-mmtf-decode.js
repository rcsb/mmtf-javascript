
//////////////////
// mmtf decoding
//
QUnit.module( "mmtf decoding" );

QUnit.test( "empty full", function( assert ) {
    var dict = getEmptyFullMmtfDict();
    assert.equal( Object.keys( dict ).length, 39, "Wrong number of fields in msgpack" );
    checkMsgpack( dict, assert, true );
    var decodedMmtf = decodeMmtf( dict, { littleEndian: true } );
    checkMmtf( decodedMmtf, assert );
    var expectedMmtf = {
        altLocList: new Uint8Array( 0 ),
        atomIdList: new Int32Array( 0 ),
        bFactorList: new Float32Array( 0 ),
        bioAssemblyList: [],
        bondAtomList: new Int32Array( 0 ),
        bondOrderList: new Uint8Array( 0 ),
        chainIdList: new Uint8Array( 0 ),
        chainNameList: new Uint8Array( 0 ),
        chainsPerModel: [],
        depositionDate: "0000-00-00",
        entityList: [],
        experimentalMethods: [],
        groupIdList: new Int32Array( 0 ),
        groupList: [],
        groupTypeList: new Int32Array( 0 ),
        groupsPerChain: [],
        insCodeList: new Uint8Array( 0 ),
        mmtfProducer: "",
        mmtfVersion: "",
        numAtoms: 0,
        numBonds: 0,
        numChains: 0,
        numGroups: 0,
        numModels: 0,
        occupancyList: new Float32Array( 0 ),
        structureId: "",
        rFree: 0,
        rWork: 0,
        releaseDate: "0000-00-00",
        resolution: 0,
        secStructList: new Int8Array( 0 ),
        sequenceIndexList:  new Int32Array( 0 ),
        spaceGroup: "",
        title: "",
        unitCell: [ 0, 0, 0, 0, 0, 0 ],
        xCoordList: new Float32Array( 0 ),
        yCoordList: new Float32Array( 0 ),
        zCoordList: new Float32Array( 0 )
    };
    assert.deepEqual( decodedMmtf, expectedMmtf, "Passed!" );
});

QUnit.test( "empty required", function( assert ) {
    var dict = getEmptyRequiredMmtfDict();
    checkMsgpack( dict, assert, true );
    var decodedMmtf = decodeMmtf( dict, { littleEndian: true } );
    checkMmtf( decodedMmtf, assert );
    var expectedMmtf = {
        chainIdList: new Uint8Array( 0 ),
        chainsPerModel: [],
        groupIdList: new Int32Array( 0 ),
        groupList: [],
        groupTypeList: new Int32Array( 0 ),
        groupsPerChain: [],
        mmtfProducer: "",
        mmtfVersion: "",
        numAtoms: 0,
        numBonds: 0,
        numChains: 0,
        numGroups: 0,
        numModels: 0,
        xCoordList: new Float32Array( 0 ),
        yCoordList: new Float32Array( 0 ),
        zCoordList: new Float32Array( 0 )
    };
    assert.deepEqual( decodedMmtf, expectedMmtf, "Passed!" );
});

QUnit.test( "filled full", function( assert ) {
    var dict = getFilledFullMmtfDict();
    assert.equal( Object.keys( dict ).length, 39, "Wrong number of fields in msgpack" );
    checkMsgpack( dict, assert, true );
    var decodedMmtf = decodeMmtf( dict, { littleEndian: true } );
    checkMmtf( decodedMmtf, assert );
    var expectedMmtf = {
        mmtfVersion: "0.1",
        mmtfProducer: "unittest",

        unitCell: [ 10, 12, 30, 90, 90, 120 ],
        structureId: "1XYZ",
        spaceGroup: "P1",
        bioAssemblyList: [
            {
                transforms: [
                    {
                        chainIndexList: [ 0 ],
                        transformation: [
                            1, 0, 0, 0,
                            0, 1, 0, 0,
                            0, 0, 1, 0,
                            0, 0, 0, 1
                        ]
                    }
                ]
            },
        ],
        title: "Full Test",
        depositionDate: "2012-10-20",
        releaseDate: "2012-11-19",
        entityList: [
            {
                chainIndexList: [ 1 ],
                description: "Some Protein",
                sequence: "A",
                type: "polymer"
            }
        ],

        experimentalMethods: [ "X-RAY DIFFRACTION" ],
        resolution: 2.5,
        rFree: 0.7,
        rWork: 0.5,

        numBonds: 1,
        numAtoms: 2,
        numGroups: 1,
        numChains: 1,
        numModels: 1,
        groupList: [
            {
                atomChargeList: [ 2, 1 ],
                elementList: [ "C", "N" ],
                atomNameList: [ "C", "N" ],
                bondAtomList: [ 0, 1 ],
                bondOrderList: [ 2 ],
                chemCompType: "L-PEPTIDE LINKING",
                singleLetterCode: "G",
                groupName: "GLY"
            }
        ],
        bondAtomList: new Int32Array( [ 0, 1, 0, 0 ] ),
        bondOrderList: new Uint8Array( [ 2, 0 ] ),

        altLocList: new Uint8Array( [ 65, 66 ] ),
        atomIdList: new Int32Array( [ 1, 2 ] ),
        bFactorList: new Float32Array( [ 99.99, 100.00 ] ),
        occupancyList: new Float32Array( [ 0.6, 0.4 ] ),
        xCoordList: new Float32Array( [ 50, 52 ] ),
        yCoordList: new Float32Array( [ 60, 63 ] ),
        zCoordList: new Float32Array( [ 70, 74 ] ),

        groupIdList: new Int32Array( [ 100 ] ),
        groupTypeList: new Int32Array( [ 0 ] ),
        secStructList: new Int8Array( [ -1 ] ),
        insCodeList: new Uint8Array( [ 88 ] ),
        sequenceIndexList: new Int32Array( [ 0 ] ),

        chainIdList: new Uint8Array( [ 0, 0, 68, 65 ] ),
        chainNameList: new Uint8Array( [  0, 0, 0, 66 ] ),
        groupsPerChain: [ 1 ],

        chainsPerModel: [ 1 ],
    };
    assert.deepEqual( decodedMmtf, expectedMmtf, "Passed!" );
});

QUnit.test( "filled required", function( assert ) {
    var dict = getFilledRequiredMmtfDict();
    checkMsgpack( dict, assert, true );
    var decodedMmtf = decodeMmtf( dict, { littleEndian: true } );
    checkMmtf( decodedMmtf, assert );
    var expectedMmtf = {
        mmtfVersion: "0.1",
        mmtfProducer: "unittest",
        numBonds: 1,
        numAtoms: 2,
        numGroups: 1,
        numChains: 1,
        numModels: 1,
        groupList: [
            {
                atomChargeList: [ 1, 0 ],
                elementList: [ "C", "N" ],
                atomNameList: [ "C", "N" ],
                bondAtomList: [ 0, 1 ],
                bondOrderList: [ 2 ],
                chemCompType: "L-PEPTIDE LINKING",
                singleLetterCode: "G",
                groupName: "GLY"
            }
        ],
        xCoordList: new Float32Array( [ 10, 11 ] ),
        yCoordList: new Float32Array( [ 20, 22 ] ),
        zCoordList: new Float32Array( [ 30, 33 ] ),
        groupIdList: new Int32Array( [ 100 ] ),
        groupTypeList: new Int32Array( [ 0 ] ),
        chainIdList: new Uint8Array( [ 0, 65, 0, 0 ] ),
        groupsPerChain: [ 1 ],

        chainsPerModel: [ 1 ],
    };
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
