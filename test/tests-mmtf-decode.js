
//////////////////
// mmtf decoding
//
QUnit.module( "mmtf decoding" );

function getEmptyFullMmtfDict(){
    return {
        // meta
        mmtfVersion: "",
        mmtfProducer: "",

        // header
        unitCell: [ 0, 0, 0, 0, 0, 0 ],
        spaceGroup: "",
        bioAssemblyList: [],
        structureId: "",
        title: "",
        entityList: [],

        experimentalMethods: [],
        resolution: 0,
        rFree: 0,
        rWork: 0,

        // counts
        numBonds: 0,
        numAtoms: 0,

        // maps
        groupMap: {},

        // bonds
        bondAtomList: new Uint8Array( 0 ),
        bondOrderList: new Uint8Array( 0 ),

        // atoms
        xCoordBig: new Uint8Array( 0 ),
        xCoordSmall: new Uint8Array( 0 ),
        yCoordBig: new Uint8Array( 0 ),
        yCoordSmall: new Uint8Array( 0 ),
        zCoordBig: new Uint8Array( 0 ),
        zCoordSmall: new Uint8Array( 0 ),
        bFactorBig: new Uint8Array( 0 ),
        bFactorSmall: new Uint8Array( 0 ),
        atomIdList: new Uint8Array( 0 ),
        altLabelList: [],
        occupancyList: new Uint8Array( 0 ),

        // groups
        groupIdList: new Uint8Array( 0 ),
        groupTypeList: new Uint8Array( 0 ),
        secStructList: new Uint8Array( 0 ),
        insCodeList: [],
        seqResIdList: new Uint8Array( 0 ),

        // chains
        chainIdList: new Uint8Array( 0 ),
        chainNameList: new Uint8Array( 0 ),
        groupsPerChain: [],

        // models
        chainsPerModel: [],
    };
}

function getEmptyRequiredMmtfDict(){
    return {
        // meta
        mmtfVersion: "",
        mmtfProducer: "",

        // counts
        numBonds: 0,
        numAtoms: 0,

        // maps
        groupMap: {},

        // atoms
        xCoordBig: new Uint8Array( 0 ),
        xCoordSmall: new Uint8Array( 0 ),
        yCoordBig: new Uint8Array( 0 ),
        yCoordSmall: new Uint8Array( 0 ),
        zCoordBig: new Uint8Array( 0 ),
        zCoordSmall: new Uint8Array( 0 ),

        // groups
        groupIdList: new Uint8Array( 0 ),
        groupTypeList: new Uint8Array( 0 ),

        // chains
        chainIdList: new Uint8Array( 0 ),
        groupsPerChain: [],

        // models
        chainsPerModel: [],
    };
}

function getFilledFullMmtfDict(){
    return {
        // meta
        mmtfVersion: "0.1",
        mmtfProducer: "unittest",

        // header
        unitCell: [ 10, 12, 30, 90, 90, 120 ],
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
        structureId: "1XYZ",
        title: "Full Test",
        entityList: [
            {
                chainIndexList: Array[1],
                description: "Some Protein",
                sequence: "A",
                type: "polymer"
            }
        ],

        experimentalMethods: [ "X-RAY DIFFRACTION" ],
        resolution: 2.5,
        rFree: 0.7,
        rWork: 0.5,

        // counts
        numBonds: 1,
        numAtoms: 2,

        // maps
        groupMap: {
            102: {
                atomCharges: [ 2, 1 ],
                atomInfo: [ "C", "C", "N", "N" ],
                bondIndices: [ 0, 1 ],
                bondOrders: [ 2 ],
                chemCompType: "L-PEPTIDE LINKING",
                singleLetterCode: "G",
                groupName: "GLY"
            }
        },

        // bonds
        bondAtomList: new Uint8Array( 0 ),
        bondOrderList: new Uint8Array( 0 ),

        // atoms
        xCoordBig: new Uint8Array( new Int32Array( [ 50000, 1 ] ).buffer ),
        xCoordSmall: new Uint8Array( new Int16Array( [ 2000 ] ).buffer ),
        yCoordBig: new Uint8Array( new Int32Array( [ 60000, 1 ] ).buffer ),
        yCoordSmall: new Uint8Array( new Int16Array( [ 3000 ] ).buffer ),
        zCoordBig: new Uint8Array( new Int32Array( [ 70000, 1 ] ).buffer ),
        zCoordSmall: new Uint8Array( new Int16Array( [ 4000 ] ).buffer ),
        bFactorBig: new Uint8Array( new Int32Array( [ 9999, 0, 1, 0 ] ).buffer ),
        bFactorSmall: new Uint8Array( new Int16Array( [] ).buffer ),
        atomIdList: new Uint8Array( new Int32Array( [ 1, 2 ] ).buffer ),
        altLabelList: new Array( "A", 1, "B", 1 ),
        occupancyList: new Uint8Array( new Int32Array( [ 60, 1, 40, 1 ] ).buffer ),

        // groups
        groupIdList: new Uint8Array( new Int32Array( [ 100, 1 ] ).buffer ),
        groupTypeList: new Uint8Array( new Int32Array( [ 102 ] ).buffer ),
        secStructList: new Uint8Array( new Int8Array( [ -1 ] ).buffer ),
        insCodeList: new Array( "X", 1 ),
        seqResIdList: new Uint8Array( new Int32Array( [ 0, 1 ] ).buffer ),

        // chains
        chainIdList: new Uint8Array( [ 65, 0, 0, 0 ] ),
        chainNameList: new Uint8Array( [ 66, 0, 0, 0 ] ),
        groupsPerChain: [ 1 ],

        // models
        chainsPerModel: [ 1 ],
    };
}

function getFilledRequiredMmtfDict(){
    return {
        // meta
        mmtfVersion: "0.1",
        mmtfProducer: "unittest",

        // counts
        numBonds: 1,
        numAtoms: 2,

        // maps
        groupMap: {
            10: {
                atomCharges: [ 1, 0 ],
                atomInfo: [ "C", "C", "N", "N" ],
                bondIndices: [ 0, 1 ],
                bondOrders: [ 2 ],
                chemCompType: "L-PEPTIDE LINKING",
                singleLetterCode: "G",
                groupName: "GLY"
            }
        },

        // atoms
        xCoordBig: new Uint8Array( new Int32Array( [ 10000, 1 ] ).buffer ),
        xCoordSmall: new Uint8Array( new Int16Array( [ 1000 ] ).buffer ),
        yCoordBig: new Uint8Array( new Int32Array( [ 20000, 1 ] ).buffer ),
        yCoordSmall: new Uint8Array( new Int16Array( [ 2000 ] ).buffer ),
        zCoordBig: new Uint8Array( new Int32Array( [ 30000, 1 ] ).buffer ),
        zCoordSmall: new Uint8Array( new Int16Array( [ 3000 ] ).buffer ),

        // groups
        groupIdList: new Uint8Array( new Int32Array( [ 100, 1 ] ).buffer ),
        groupTypeList: new Uint8Array( new Int32Array( [ 10 ] ).buffer ),

        // chains
        chainIdList: new Uint8Array( [ 65, 0, 0, 0 ] ),
        groupsPerChain: [ 1 ],

        // models
        chainsPerModel: [ 1 ],
    };
}

QUnit.test( "empty full", function( assert ) {
    var dict = getEmptyFullMmtfDict();
    assert.equal( Object.keys( dict ).length, 37, "Wrong number of fields in msgpack" );
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
        entityList: [],
        experimentalMethods: [],
        groupIdList: new Int32Array( 0 ),
        groupMap: {},
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
        groupMap: {},
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
    assert.equal( Object.keys( dict ).length, 37, "Wrong number of fields in msgpack" );
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
        numBonds: 1,
        numAtoms: 2,
        numGroups: 1,
        numChains: 1,
        numModels: 1,
        groupMap: {
            102: {
                atomCharges: [ 2, 1 ],
                atomInfo: [ "C", "C", "N", "N" ],
                bondIndices: [ 0, 1 ],
                bondOrders: [ 2 ],
                chemCompType: "L-PEPTIDE LINKING",
                singleLetterCode: "G",
                groupName: "GLY"
            }
        },
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

    assert.deepEqual( decodedMmtf.groupMap, expectedMmtf.groupMap, "Passed groupMap!" );
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
        groupMap: {
            10: {
                atomCharges: [ 1, 0 ],
                atomInfo: [ "C", "C", "N", "N" ],
                bondIndices: [ 0, 1 ],
                bondOrders: [ 2 ],
                chemCompType: "L-PEPTIDE LINKING",
                singleLetterCode: "G",
                groupName: "GLY"
            }
        },
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

    assert.deepEqual( decodedMmtf.groupMap, expectedMmtf.groupMap, "Passed groupMap!" );
    assert.deepEqual( decodedMmtf.bondStore, expectedMmtf.bondStore, "Passed bondStore!" );
    assert.deepEqual( decodedMmtf.atomStore, expectedMmtf.atomStore, "Passed atomStore!" );
    assert.deepEqual( decodedMmtf.groupStore, expectedMmtf.groupStore, "Passed groupStore!" );
    assert.deepEqual( decodedMmtf.chainStore, expectedMmtf.chainStore, "Passed chainStore!" );
    assert.deepEqual( decodedMmtf.modelStore, expectedMmtf.modelStore, "Passed modelStore!" );
});

QUnit.test( "empty required missing", function( assert ) {
    // not all throw an error with an empty mmtf dict, only tested with a filled mmtf dict
    var names = [
        // "groupMap", "numBonds", "numAtoms",
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
