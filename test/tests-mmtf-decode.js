
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
        pdbId: "",
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
        occList: new Uint8Array( 0 ),

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
        pdbId: "1XYZ",
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
        occList: new Uint8Array( new Int32Array( [ 60, 1, 40, 1 ] ).buffer ),

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
        mmtfVersion: "",
        mmtfProducer: "",
        pdbId: "",
        spaceGroup: "",
        bioAssemblyList: [],
        title: "",
        unitCell: [ 0, 0, 0, 0, 0, 0 ],
        entityList: [],
        experimentalMethods: [],
        resolution: 0,
        rFree: 0,
        rWork: 0,
        numAtoms: 0,
        numBonds: 0,
        numChains: 0,
        numGroups: 0,
        numModels: 0,
        groupMap: {},
        bondStore: {
            "atomIndex1": new Uint32Array( 0 ),
            "atomIndex2": new Uint32Array( 0 ),
            "bondOrder": new Uint8Array( 0 )
        },
        atomStore: {
            "altLabel": new Uint8Array( 0 ),
            "atomId": new Int32Array( 0 ),
            "bFactor": new Float32Array( 0 ),
            "groupIndex": new Uint32Array( 0 ),
            "occupancy": new Float32Array( 0 ),
            "xCoord": new Float32Array( 0 ),
            "yCoord": new Float32Array( 0 ),
            "zCoord": new Float32Array( 0 )
        },
        groupStore: {
            "atomCount": new Uint16Array( 0 ),
            "atomOffset": new Uint32Array( 0 ),
            "chainIndex": new Uint32Array( 0 ),
            "groupId": new Int32Array( 0 ),
            "groupTypeId": new Uint16Array( 0 ),
            "secStruct": new Int8Array( 0 ),
            "insCode": new Uint8Array( 0 )
        },
        chainStore: {
            "chainId": new Uint8Array( 0 ),
            "chainName": new Uint8Array( 0 ),
            "groupCount": new Uint32Array( 0 ),
            "groupOffset": new Uint32Array( 0 ),
            "modelIndex": new Uint16Array( 0 )
        },
        modelStore: {
            "chainCount": new Uint32Array( 0 ),
            "chainOffset": new Uint32Array( 0 )
        }
    };
    assert.deepEqual( decodedMmtf, expectedMmtf, "Passed!" );
});

QUnit.test( "empty required", function( assert ) {
    var dict = getEmptyRequiredMmtfDict();
    checkMsgpack( dict, assert, true );
    var decodedMmtf = decodeMmtf( dict, { littleEndian: true } );
    checkMmtf( decodedMmtf, assert );
    var expectedMmtf = {
        mmtfVersion: "",
        mmtfProducer: "",
        pdbId: undefined,
        spaceGroup: undefined,
        bioAssemblyList: undefined,
        title: undefined,
        unitCell: undefined,
        entityList: undefined,
        experimentalMethods: undefined,
        resolution: undefined,
        rFree: undefined,
        rWork: undefined,
        numAtoms: 0,
        numBonds: 0,
        numChains: 0,
        numGroups: 0,
        numModels: 0,
        groupMap: {},
        bondStore: {
            "atomIndex1": new Uint32Array( 0 ),
            "atomIndex2": new Uint32Array( 0 ),
            "bondOrder": new Uint8Array( 0 )
        },
        atomStore: {
            "altLabel": undefined,
            "atomId": undefined,
            "bFactor": undefined,
            "groupIndex": new Uint32Array( 0 ),
            "occupancy": undefined,
            "xCoord": new Float32Array( 0 ),
            "yCoord": new Float32Array( 0 ),
            "zCoord": new Float32Array( 0 )
        },
        groupStore: {
            "atomCount": new Uint16Array( 0 ),
            "atomOffset": new Uint32Array( 0 ),
            "chainIndex": new Uint32Array( 0 ),
            "groupId": new Int32Array( 0 ),
            "groupTypeId": new Uint16Array( 0 ),
            "secStruct": undefined,
            "insCode": undefined
        },
        chainStore: {
            "chainId": new Uint8Array( 0 ),
            "chainName": undefined,
            "groupCount": new Uint32Array( 0 ),
            "groupOffset": new Uint32Array( 0 ),
            "modelIndex": new Uint16Array( 0 )
        },
        modelStore: {
            "chainCount": new Uint32Array( 0 ),
            "chainOffset": new Uint32Array( 0 )
        }
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
        pdbId: "1XYZ",
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
        bondStore: {
            "atomIndex1": new Uint32Array( [ 0, 0 ] ),
            "atomIndex2": new Uint32Array( [ 1, 0 ] ),
            "bondOrder": new Uint8Array( [ 2, 0 ] )
        },
        atomStore: {
            "altLabel": new Uint8Array( [ 65, 66 ] ),
            "atomId": new Int32Array( [ 1, 2 ] ),
            "bFactor": new Float32Array( [ 99.99, 100.00 ] ),
            "groupIndex": new Uint32Array( 2 ),
            "occupancy": new Float32Array( [ 0.6, 0.4 ] ),
            "xCoord": new Float32Array( [ 50, 52 ] ),
            "yCoord": new Float32Array( [ 60, 63 ] ),
            "zCoord": new Float32Array( [ 70, 74 ] )
        },
        groupStore: {
            "atomCount": new Uint16Array( [ 2 ] ),
            "atomOffset": new Uint32Array( [ 0 ] ),
            "chainIndex": new Uint32Array( [ 0 ] ),
            "groupId": new Int32Array( [ 100 ] ),
            "groupTypeId": new Uint16Array( [ 102 ] ),
            "secStruct": new Int8Array( [ -1 ] ),
            "insCode": new Uint8Array( [ 88 ] )
        },
        chainStore: {
            "chainId": new Uint8Array( [ 65, 0, 0, 0 ] ),
            "chainName": new Uint8Array( [  66, 0, 0, 0 ] ),
            "groupCount": new Uint32Array( [ 1 ] ),
            "groupOffset": new Uint32Array( [ 0 ] ),
            "modelIndex": new Uint16Array( [ 0 ] )
        },
        modelStore: {
            "chainCount": new Uint32Array( [ 1 ] ),
            "chainOffset": new Uint32Array( [ 0 ] )
        }
    };
    assert.equal( decodedMmtf.pdbId, expectedMmtf.pdbId, "Passed pdbId!" );
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
        pdbId: undefined,
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
        bondStore: {
            "atomIndex1": new Uint32Array( [ 0, 0 ] ),
            "atomIndex2": new Uint32Array( [ 1, 0 ] ),
            "bondOrder": new Uint8Array( [ 2, 0 ] )
        },
        atomStore: {
            "altLabel": undefined,
            "atomId": undefined,
            "bFactor": undefined,
            "groupIndex": new Uint32Array( 2 ),
            "occupancy": undefined,
            "xCoord": new Float32Array( [ 10, 11 ] ),
            "yCoord": new Float32Array( [ 20, 22 ] ),
            "zCoord": new Float32Array( [ 30, 33 ] )
        },
        groupStore: {
            "atomCount": new Uint16Array( [ 2 ] ),
            "atomOffset": new Uint32Array( [ 0 ] ),
            "chainIndex": new Uint32Array( [ 0 ] ),
            "groupId": new Int32Array( [ 100 ] ),
            "groupTypeId": new Uint16Array( [ 10 ] ),
            "secStruct": undefined,
            "insCode": undefined
        },
        chainStore: {
            "chainId": new Uint8Array( [ 65, 0, 0, 0 ] ),
            "chainName": undefined,
            "groupCount": new Uint32Array( [ 1 ] ),
            "groupOffset": new Uint32Array( [ 0 ] ),
            "modelIndex": new Uint16Array( [ 0 ] )
        },
        modelStore: {
            "chainCount": new Uint32Array( [ 1 ] ),
            "chainOffset": new Uint32Array( [ 0 ] )
        }
    };
    assert.equal( decodedMmtf.pdbId, expectedMmtf.pdbId, "Passed pdbId!" );
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
