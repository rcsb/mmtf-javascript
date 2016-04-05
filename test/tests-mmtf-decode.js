
//////////////////
// mmtf decoding
//
QUnit.module( "mmtf decoding" );

QUnit.test( "empty full", function( assert ) {
    var dict = getEmptyFullMmtfDict();
    assert.equal( Object.keys( dict ).length, 38, "Wrong number of fields in msgpack" );
    checkMsgpack( dict, assert, true );
    var decodedMmtf = decodeMmtf( dict, { littleEndian: true } );
    checkMmtf( decodedMmtf, assert );
    var expectedMmtf = {
        altLabelList: new Uint8Array( 0 ),
        atomIdList: new Int32Array( 0 ),
        bFactorList: new Float32Array( 0 ),
        bioAssemblyList: [],
        bondAtomList: new Int32Array( 0 ),
        bondOrderList: new Uint8Array( 0 ),
        chainIdList: new Uint8Array( 0 ),
        chainNameList: new Uint8Array( 0 ),
        chainsPerModel: [],
        date: "0000-00-00",
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
        resolution: 0,
        secStructList: new Int8Array( 0 ),
        sequenceIdList:  new Int32Array( 0 ),
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
    assert.equal( Object.keys( dict ).length, 38, "Wrong number of fields in msgpack" );
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
                        chainIdList: [ "A" ],
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
        date: "2012-10-20",
        numBonds: 1,
        numAtoms: 2,
        numGroups: 1,
        numChains: 1,
        numModels: 1,
        groupList: [
            {
                atomCharges: [ 2, 1 ],
                atomInfo: [ "C", "C", "N", "N" ],
                bondIndices: [ 0, 1 ],
                bondOrders: [ 2 ],
                chemCompType: "L-PEPTIDE LINKING",
                singleLetterCode: "G",
                groupName: "GLY"
            }
        ],
        bondAtomList: new Uint32Array( [ 0, 1, 0, 0 ] ),
        bondOrderList: new Uint8Array( [ 2, 0 ] ),
        altLabelList: new Uint8Array( [ 65, 66 ] ),
        atomIdList: new Int32Array( [ 1, 2 ] ),
        bFactorList: new Float32Array( [ 99.99, 100.00 ] ),
        occupancyList: new Float32Array( [ 0.6, 0.4 ] ),
        xCoordListList: new Float32Array( [ 50, 52 ] ),
        yCoordListList: new Float32Array( [ 60, 63 ] ),
        zCoordListList: new Float32Array( [ 70, 74 ] ),
        groupIdList: new Int32Array( [ 100 ] ),
        groupTypeList: new Uint16Array( [ 102 ] ),
        secStructList: new Int8Array( [ -1 ] ),
        insCodeList: new Uint8Array( [ 88 ] ),
        chainIdList: new Uint8Array( [ 65, 0, 0, 0 ] ),
        chainNameList: new Uint8Array( [  66, 0, 0, 0 ] )
    };
    assert.equal( decodedMmtf.structureId, expectedMmtf.structureId, "Passed structureId!" );
    assert.equal( decodedMmtf.spaceGroup, expectedMmtf.spaceGroup, "Passed spaceGroup!" );
    assert.deepEqual( decodedMmtf.bioAssemblyList, expectedMmtf.bioAssemblyList, "Passed bioAssemblyList!" );
    assert.equal( decodedMmtf.title, expectedMmtf.title, "Passed title!" );
    assert.deepEqual( decodedMmtf.unitCell, expectedMmtf.unitCell, "Passed unitcell!" );

    assert.equal( decodedMmtf.numBonds, expectedMmtf.numBonds, "Passed numBonds!" );
    assert.equal( decodedMmtf.numAtoms, expectedMmtf.numAtoms, "Passed numAtoms!" );
    assert.equal( decodedMmtf.numGroups, expectedMmtf.numGroups, "Passed numGroups!" );
    assert.equal( decodedMmtf.numChains, expectedMmtf.numChains, "Passed numChains!" );
    assert.equal( decodedMmtf.numModels, expectedMmtf.numModels, "Passed numModels!" );

    assert.deepEqual( decodedMmtf.groupList, expectedMmtf.groupList, "Passed groupList!" );
    assert.deepEqual( decodedMmtf.bondStore, expectedMmtf.bondStore, "Passed bondStore!" );
    assert.deepEqual( decodedMmtf.atomStore, expectedMmtf.atomStore, "Passed atomStore!" );
    assert.deepEqual( decodedMmtf.groupStore, expectedMmtf.groupStore, "Passed groupStore!" );
    assert.deepEqual( decodedMmtf.chainStore, expectedMmtf.chainStore, "Passed chainStore!" );
    assert.deepEqual( decodedMmtf.modelStore, expectedMmtf.modelStore, "Passed modelStore!" );
});

QUnit.test( "filled required", function( assert ) {
    var dict = getFilledRequiredMmtfDict();
    checkMsgpack( dict, assert, true );
    var decodedMmtf = decodeMmtf( dict, { littleEndian: true } );
    checkMmtf( decodedMmtf, assert );
    var expectedMmtf = {
        mmtfVersion: "0.1",
        mmtfProducer: "unittest",
        structureId: undefined,
        spaceGroup: undefined,
        bioAssemblyList: undefined,
        title: undefined,
        unitCell: undefined,
        numBonds: 1,
        numAtoms: 2,
        numGroups: 1,
        numChains: 1,
        numModels: 1,
        groupList: [
            {
                atomCharges: [ 1, 0 ],
                atomInfo: [ "C", "C", "N", "N" ],
                bondIndices: [ 0, 1 ],
                bondOrders: [ 2 ],
                chemCompType: "L-PEPTIDE LINKING",
                singleLetterCode: "G",
                groupName: "GLY"
            }
        ],
        xCoordList: new Float32Array( [ 10, 11 ] ),
        yCoordList: new Float32Array( [ 20, 22 ] ),
        zCoordList: new Float32Array( [ 30, 33 ] ),
        groupIdList: new Int32Array( [ 100 ] ),
        groupTypeList: new Int32Array( [ 10 ] ),
        chainIdList: new Uint8Array( [ 65, 0, 0, 0 ] )
    };
    assert.equal( decodedMmtf.structureId, expectedMmtf.structureId, "Passed structureId!" );
    assert.equal( decodedMmtf.spaceGroup, expectedMmtf.spaceGroup, "Passed spaceGroup!" );
    assert.deepEqual( decodedMmtf.bioAssemblyList, expectedMmtf.bioAssemblyList, "Passed bioAssemblyList!" );
    assert.equal( decodedMmtf.title, expectedMmtf.title, "Passed title!" );
    assert.deepEqual( decodedMmtf.unitCell, expectedMmtf.unitCell, "Passed unitcell!" );

    assert.equal( decodedMmtf.numBonds, expectedMmtf.numBonds, "Passed numBonds!" );
    assert.equal( decodedMmtf.numAtoms, expectedMmtf.numAtoms, "Passed numAtoms!" );
    assert.equal( decodedMmtf.numGroups, expectedMmtf.numGroups, "Passed numGroups!" );
    assert.equal( decodedMmtf.numChains, expectedMmtf.numChains, "Passed numChains!" );
    assert.equal( decodedMmtf.numModels, expectedMmtf.numModels, "Passed numModels!" );

    assert.deepEqual( decodedMmtf.groupList, expectedMmtf.groupList, "Passed groupList!" );
    assert.deepEqual( decodedMmtf.bondStore, expectedMmtf.bondStore, "Passed bondStore!" );
    assert.deepEqual( decodedMmtf.atomStore, expectedMmtf.atomStore, "Passed atomStore!" );
    assert.deepEqual( decodedMmtf.groupStore, expectedMmtf.groupStore, "Passed groupStore!" );
    assert.deepEqual( decodedMmtf.chainStore, expectedMmtf.chainStore, "Passed chainStore!" );
    assert.deepEqual( decodedMmtf.modelStore, expectedMmtf.modelStore, "Passed modelStore!" );
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
