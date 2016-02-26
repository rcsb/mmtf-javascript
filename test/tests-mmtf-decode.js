
/////////////////////
// decoding helpers
//
QUnit.module( "decoding helpers" );

QUnit.test( "getInt8View", function( assert ) {
    var buffer = new ArrayBuffer( 1 * 20 );
    var view = new Int8Array( buffer, 4 );
    view[0] = 12;
    view[2] = -4;
    var view2 = new Uint8Array( buffer, 4 );
    var int8 = getInt8View( view2 );
    assert.equal( int8[0], 12, "Passed!" );
    assert.equal( int8[1], 0, "Passed!" );
    assert.equal( int8[2], -4, "Passed!" );
});

QUnit.test( "getUint8View", function( assert ) {
    var buffer = new ArrayBuffer( 1 * 20 );
    var view = new Uint8Array( buffer, 4 );
    view[0] = 16;
    view[2] = 5;
    var view2 = new Uint8Array( buffer, 4 );
    var int8 = getUint8View( view2 );
    assert.equal( int8[0], 16, "Passed!" );
    assert.equal( int8[1], 0, "Passed!" );
    assert.equal( int8[2], 5, "Passed!" );
});

QUnit.test( "getInt16", function( assert ) {
    var buffer = new ArrayBuffer( 2 * 20 );
    var view = new Int16Array( buffer, 8 );
    view[0] = 18902;
    view[2] = -4467;
    var view2 = new Uint8Array( buffer, 8 );
    var int16 = getInt16( view2, undefined, true );
    assert.equal( int16[0], 18902, "Passed!" );
    assert.equal( int16[1], 0, "Passed!" );
    assert.equal( int16[2], -4467, "Passed!" );
});

QUnit.test( "getInt32", function( assert ) {
    var buffer = new ArrayBuffer( 4 * 40 );
    var view = new Int32Array( buffer, 16 );
    view[0] = 3418902;
    view[2] = -743467;
    var view2 = new Uint8Array( buffer, 16 );
    var int32 = getInt32( view2, undefined, true );
    assert.equal( int32[0], 3418902, "Passed!" );
    assert.equal( int32[1], 0, "Passed!" );
    assert.equal( int32[2], -743467, "Passed!" );
});

QUnit.test( "decodeFloat", function( assert ) {
    var intArray = new Int32Array([
        12, 34, 543, 687, 2, 0, 4689
    ]);
    var expectedFloatArray = new Float32Array([
        0.12, 0.34, 5.43, 6.87, 0.02, 0.00, 46.89
    ]);
    var divisor = 100;
    var decodedFloatArray = decodeFloat( intArray, divisor );
    assert.deepEqual( decodedFloatArray, expectedFloatArray, "Passed!" );
});

QUnit.test( "decodeRunLength", function( assert ) {
    var runs = new Int32Array([
        0, 2, 3, 5
    ]);
    var expected = new Int32Array([
        0, 0, 3, 3, 3, 3, 3
    ]);
    var decoded = decodeRunLength( runs );
    assert.equal( decoded.length, 7, "Passed!" );
    assert.deepEqual( decoded, expected, "Passed!" );
});

QUnit.test( "decodeDelta", function( assert ) {
    var deltas = new Int32Array([
        0, 2, 1, 2, 1, 1, -4, -2, 9
    ]);
    var expected = new Int32Array([
        0, 2, 3, 5, 6, 7, 3, 1, 10
    ]);
    var decoded = decodeDelta( deltas );
    assert.equal( decoded.length, expected.length, "Passed!" );
    assert.deepEqual( decoded, expected, "Passed!" );
});

QUnit.test( "decodeSplitListDelta", function( assert ) {
    var deltasBig = new Int32Array([
        200, 3, 100, 2
    ]);
    var deltasSmall = new Int8Array([
        0, 2, -1, -3, 5
    ]);
    var expected = new Int32Array([
        200, 200, 202, 201, 301, 298, 303
    ]);
    var decoded = decodeSplitListDelta( deltasBig, deltasSmall );
    assert.equal( decoded.length, deltasBig.length/2 + deltasSmall.length, "Passed!" );
    assert.equal( decoded.length, expected.length, "Passed!" );
    assert.deepEqual( decoded, expected, "Passed!" );
});

QUnit.test( "decodeFloatSplitList", function( assert ) {
    var deltasBig = new Int32Array([
        100, 3, -200, 2
    ]);
    var deltasSmall = new Int16Array([
        0, 2, -1, -3, 5
    ]);
    var expected = new Float32Array([
        1.00, 1.00, 1.02, 1.01, -0.99, -1.02, -0.97
    ]);
    var deltasBigUint8 = new Uint8Array( deltasBig.buffer );
    var deltasSmallUint8 = new Uint8Array( deltasSmall.buffer );
    var divisor = 100;
    var decoded = decodeFloatSplitList( deltasBigUint8, deltasSmallUint8, divisor, undefined, true );
    assert.equal( decoded.length, deltasBig.length/2 + deltasSmall.length, "Passed!" );
    assert.close( decoded[0], expected[0], 0.001, "Passed!" );
    assert.close( decoded[1], expected[1], 0.001, "Passed!" );
    assert.close( decoded[2], expected[2], 0.001, "Passed!" );
    assert.close( decoded[3], expected[3], 0.001, "Passed!" );
    assert.close( decoded[4], expected[4], 0.001, "Passed!" );
    assert.close( decoded[5], expected[5], 0.001, "Passed!" );
    assert.close( decoded[6], expected[6], 0.001, "Passed!" );
});


//////////////////
// mmtf decoding
//
QUnit.module( "mmtf decoding" );

function getEmptyFullMmtfDict(){
    return {
        // header
        unitCell: undefined,
        spaceGroup: undefined,
        bioAssembly: undefined,
        pdbId: undefined,
        title: undefined,

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
        altLabelList: new Array( 0 ),
        insCodeList: new Array( 0 ),
        occList: new Uint8Array( 0 ),

        // groups
        groupNumList: new Uint8Array( 0 ),
        groupTypeList: new Uint8Array( 0 ),
        secStructList: new Uint8Array( 0 ),

        // chains
        chainList: new Uint8Array( 0 ),
        groupsPerChain: new Uint8Array( 0 ),

        // models
        chainsPerModel: new Uint8Array( 0 ),
    };
}

function getEmptyRequiredMmtfDict(){
    return {
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
        groupNumList: new Uint8Array( 0 ),
        groupTypeList: new Uint8Array( 0 ),
        secStructList: new Uint8Array( 0 ),

        // chains
        chainList: new Uint8Array( 0 ),
        groupsPerChain: new Uint8Array( 0 ),

        // models
        chainsPerModel: new Uint8Array( 0 ),
    };
}

QUnit.test( "empty complete", function( assert ) {
    var dict = getEmptyFullMmtfDict();
    var decodedMmtf = decodeMmtf( dict );
    var expectedMmtf = {
        pdbId: undefined,
        spaceGroup: undefined,
        bioAssembly: undefined,
        title: undefined,
        unitCell: undefined,
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
            "insCode": new Uint8Array( 0 ),
            "occupancy": new Float32Array( 0 ),
            "xCoord": new Float32Array( 0 ),
            "yCoord": new Float32Array( 0 ),
            "zCoord": new Float32Array( 0 )
        },
        groupStore: {
            "atomCount": new Uint16Array( 0 ),
            "atomOffset": new Uint32Array( 0 ),
            "chainIndex": new Uint32Array( 0 ),
            "groupNum": new Int32Array( 0 ),
            "groupTypeId": new Uint16Array( 0 ),
            "secStruct": new Uint8Array( 0 )
        },
        chainStore: {
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
    var decodedMmtf = decodeMmtf( dict );
    var expectedMmtf = {
        pdbId: undefined,
        spaceGroup: undefined,
        bioAssembly: undefined,
        title: undefined,
        unitCell: undefined,
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
            "insCode": new Uint8Array( 0 ),
            "occupancy": new Float32Array( 0 ),
            "xCoord": new Float32Array( 0 ),
            "yCoord": new Float32Array( 0 ),
            "zCoord": new Float32Array( 0 )
        },
        groupStore: {
            "atomCount": new Uint16Array( 0 ),
            "atomOffset": new Uint32Array( 0 ),
            "chainIndex": new Uint32Array( 0 ),
            "groupNum": new Int32Array( 0 ),
            "groupTypeId": new Uint16Array( 0 ),
            "secStruct": new Uint8Array( 0 )
        },
        chainStore: {
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

QUnit.test( "empty required missing", function( assert ) {
    // not all throw an error with an empty mmtf dict, only tested with a filled mmtf dict
    var names = [
        // "groupMap", "numBonds", "numAtoms",
        "xCoordBig", "xCoordSmall", "yCoordBig", "yCoordSmall", "zCoordBig", "zCoordSmall",
        "groupNumList", "groupTypeList", "secStructList", "chainList",
        // "groupsPerChain",
        "chainsPerModel"
    ];
    names.forEach( function( name ){
        var dict = getEmptyRequiredMmtfDict();
        delete dict[ name ];
        assert.throws( function(){ decodeMmtf( dict ) }, "TypeError " + name );
    } );
});
