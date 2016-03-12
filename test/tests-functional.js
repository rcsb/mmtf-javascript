
/////////////////////
// functional tests
//
QUnit.module( "functional tests" );

function loadFile( url, onload, onerror ){
    var xhr = new XMLHttpRequest();
    xhr.addEventListener( "load", onload, true );
    xhr.addEventListener( "error", onerror, true );
    xhr.open( "GET", url, true );
    xhr.responseType = "arraybuffer";
    xhr.send();
}

function checkDictFields( dict, reqFields, optFields, label, assert ){
    var keys = Object.keys( dict );
    var reqCount = 0;
    keys.forEach( function( name ){
        var inReqFields = reqFields.indexOf( name ) !== -1;
        var inOptFields = optFields.indexOf( name ) !== -1;
        if( inReqFields ) reqCount += 1;
        assert.ok(
            inReqFields || inOptFields,
            "Unknown " + label + " field with name '" + name + "'"
        );
        assert.ok(
            !( inReqFields && inOptFields ),
            label + " field with name '" + name + "' can not be req & opt"
        );
    } );
    assert.equal( reqCount, reqFields.length, label + " req props missing" );
}

function checkMsgpackFields( decodedMsgpack, assert ){
    var reqTopLevelFields = [
        // meta
        "mmtfVersion", "mmtfProducer",
        // header

        // counts
        "numBonds", "numAtoms",
        // maps
        "groupMap",
        // bonds

        // atoms
        "xCoordBig", "xCoordSmall", "yCoordBig", "yCoordSmall", "zCoordBig", "zCoordSmall",
        // groups
        "groupIdList", "groupTypeList",
        // chains
        "chainIdList", "groupsPerChain",
        // models
        "chainsPerModel"
    ];
    var optTopLevelFields = [
        // meta

        // header
        "title", "pdbId", "bioAssembly", "unitCell", "spaceGroup", "experimentalMethods",
        // counts

        // maps

        // bonds
        "bondAtomList", "bondOrderList",
        // atoms
        "bFactorBig", "bFactorSmall", "atomIdList", "altLabelList", "insCodeList", "occList",
        // groups
        "secStructList", "seqResIdList",
        // chains
        "chainNameList", "chainSeqList"
        // models

    ];
    checkDictFields(
        decodedMsgpack, reqTopLevelFields, optTopLevelFields, "topLevel", assert
    );

    var reqGroupTypeFields = [
        "atomCharges", "atomInfo", "bondIndices", "bondOrders",
        "groupName", "singleLetterCode", "chemCompType"
    ];
    for( var groupTypeId in decodedMsgpack.groupMap ){
        var groupType = decodedMsgpack.groupMap[ groupTypeId ];
        checkDictFields(
            groupType, reqGroupTypeFields, [], "groupType", assert
        );
    }
}

function checkMmtfFields( decodedMmtf, assert ){
    var topLevelFields = [
        // header
        "unitCell", "spaceGroup", "bioAssembly", "pdbId", "title",
        // counts
        "numBonds", "numAtoms", "numGroups", "numChains", "numModels",
        // stores
        "bondStore", "atomStore", "groupStore", "chainStore", "modelStore",
        // maps
        "groupMap"
    ];
    checkDictFields(
        decodedMmtf, topLevelFields, [], "topLevel", assert
    );

    var reqGroupTypeFields = [
        "atomCharges", "atomInfo", "bondIndices", "bondOrders",
        "groupName", "singleLetterCode", "chemCompType"
    ];
    for( var groupTypeId in decodedMmtf.groupMap ){
        var groupType = decodedMmtf.groupMap[ groupTypeId ];
        checkDictFields(
            groupType, reqGroupTypeFields, [], "groupType", assert
        );
    }

    var reqBondStoreFields = [
        "atomIndex1", "atomIndex2", "bondOrder"
    ];
    checkDictFields(
        decodedMmtf.bondStore, reqBondStoreFields, [], "bondStore", assert
    );

    var reqAtomStoreFields = [
        "groupIndex", "xCoord", "yCoord", "zCoord", "bFactor",
        "atomId", "altLabel", "insCode", "occupancy"
    ];
    checkDictFields(
        decodedMmtf.atomStore, reqAtomStoreFields, [], "atomStore", assert
    );

    var reqGroupStoreFields = [
        "chainIndex", "atomOffset", "atomCount", "groupId", "groupTypeId", "secStruct"
    ];
    checkDictFields(
        decodedMmtf.groupStore, reqGroupStoreFields, [], "groupStore", assert
    );

    var reqChainStoreFields = [
        "modelIndex", "groupOffset", "groupCount", "chainName"
    ];
    checkDictFields(
        decodedMmtf.chainStore, reqChainStoreFields, [], "chainStore", assert
    );

    var reqModelStoreFields = [
        "chainOffset", "chainCount"
    ];
    checkDictFields(
        decodedMmtf.modelStore, reqModelStoreFields, [], "modelStore", assert
    );
}

function checkMmtfConsistency( decodedMmtf, assert ){
    // check consistency of groupMap entries
    var groupTypeFields = [
        "atomCharges", "atomInfo", "bondIndices", "bondOrders"
    ];
    for( var groupId in decodedMmtf.groupMap ){
        var groupType = decodedMmtf.groupMap[ groupId ];
        groupTypeFields.forEach( function( name ){
            assert.ok(
                groupType[ name ] !== undefined,
                "groupType['" + name + "''] must not be undefined"
            );
        } );
        assert.ok(
            groupType.atomCharges.length * 2 === groupType.atomInfo.length,
            "atomInfo.length must equal atomCharges.length"
        );
        assert.ok(
            groupType.bondOrders.length * 2 === groupType.bondIndices.length,
            "atomInfo.length must equal bondOrders.length"
        );
    }

    // check sizes for consistency
    var bondStore = decodedMmtf.bondStore;
    assert.equal( bondStore.atomIndex1.length, decodedMmtf.numBonds + decodedMmtf.numGroups, "Passed!" );
    assert.equal( bondStore.atomIndex2.length, decodedMmtf.numBonds + decodedMmtf.numGroups, "Passed!" );
    assert.equal( bondStore.bondOrder.length, decodedMmtf.numBonds + decodedMmtf.numGroups, "Passed!" );

    var atomStore = decodedMmtf.atomStore;
    assert.equal( atomStore.groupIndex.length, decodedMmtf.numAtoms, "numAtoms, groupIndex" );
    assert.equal( atomStore.xCoord.length, decodedMmtf.numAtoms, "numAtoms, xCoord" );
    assert.equal( atomStore.yCoord.length, decodedMmtf.numAtoms, "numAtoms, yCoord" );
    assert.equal( atomStore.zCoord.length, decodedMmtf.numAtoms, "numAtoms, zCoord" );
    assert.equal( atomStore.bFactor.length, decodedMmtf.numAtoms, "numAtoms, bFactor" );
    assert.equal( atomStore.atomId.length, decodedMmtf.numAtoms, "numAtoms, atomId" );
    assert.equal( atomStore.altLabel.length, decodedMmtf.numAtoms, "numAtoms, altLabel" );
    assert.equal( atomStore.insCode.length, decodedMmtf.numAtoms, "numAtoms, insCode" );
    assert.equal( atomStore.occupancy.length, decodedMmtf.numAtoms, "numAtoms, occupancy" );

    var groupStore = decodedMmtf.groupStore;
    assert.equal( groupStore.chainIndex.length, decodedMmtf.numGroups, "numGroups, chainIndex" );
    assert.equal( groupStore.atomOffset.length, decodedMmtf.numGroups, "numGroups, atomOffset" );
    assert.equal( groupStore.atomCount.length, decodedMmtf.numGroups, "numGroups, atomCount" );
    assert.equal( groupStore.groupTypeId.length, decodedMmtf.numGroups, "numGroups, groupTypeId" );
    assert.equal( groupStore.groupId.length, decodedMmtf.numGroups, "numGroups, groupId" );
    assert.equal( groupStore.secStruct.length, decodedMmtf.numGroups, "numGroups, secStruct" );

    var chainStore = decodedMmtf.chainStore;
    assert.equal( chainStore.modelIndex.length, decodedMmtf.numChains, "numChains, modelIndex" );
    assert.equal( chainStore.groupOffset.length, decodedMmtf.numChains, "numChains, groupOffset" );
    assert.equal( chainStore.groupCount.length, decodedMmtf.numChains, "numChains, groupCount" );
    assert.equal( chainStore.chainName.length, decodedMmtf.numChains * 4, "numChains, chainName" );

    var modelStore = decodedMmtf.modelStore;
    assert.equal( modelStore.chainOffset.length, decodedMmtf.numModels, "numModels, chainOffset" );
    assert.equal( modelStore.chainCount.length, decodedMmtf.numModels, "numModels, chainCount" );
}

// curl http://mmtf.rcsb.org/full/1crn -o data/1crn.mmtf.gz
// gzip -df data/1crn.mmtf.gz
QUnit.test( "decode 1crn", function( assert ) {
    var done = assert.async();
    function onload(){
        var decodedMmtf = decodeMmtf( this.response );

        assert.equal( decodedMmtf.pdbId, "1CRN", "Passed!" );
        assert.equal( decodedMmtf.spaceGroup, "P 1 21 1", "Passed!" );
        assert.close( decodedMmtf.unitCell[ 0 ], 40.959, 0.001, "Passed!" );
        assert.close( decodedMmtf.unitCell[ 1 ], 18.649, 0.001, "Passed!" );
        assert.close( decodedMmtf.unitCell[ 2 ], 22.520, 0.001, "Passed!" );
        assert.close( decodedMmtf.unitCell[ 3 ], 90, 0.001, "Passed!" );
        assert.close( decodedMmtf.unitCell[ 4 ], 90.769, 0.001, "Passed!" );
        assert.close( decodedMmtf.unitCell[ 5 ], 90, 0.001, "Passed!" );
        assert.equal( decodedMmtf.title, "WATER STRUCTURE OF A HYDROPHOBIC PROTEIN AT ATOMIC RESOLUTION. PENTAGON RINGS OF WATER MOLECULES IN CRYSTALS OF CRAMBIN", "Passed!" );

        assert.equal( decodedMmtf.numBonds, 385, "Passed!" );
        assert.equal( decodedMmtf.numAtoms, 327, "Passed!" );
        assert.equal( decodedMmtf.numGroups, 46, "Passed!" );
        assert.equal( decodedMmtf.numChains, 1, "Passed!" );
        assert.equal( decodedMmtf.numModels, 1, "Passed!" );

        assert.equal( Object.keys( decodedMmtf.groupMap ).length, 16, "Passed!" );

        checkMmtfFields( decodedMmtf, assert );
        checkMmtfConsistency( decodedMmtf, assert );

        done();
    }
    function onerror(){
        done();
    }
    loadFile( "../data/1crn.mmtf", onload, onerror );
});

QUnit.test( "decode 1crn msgpack", function( assert ) {
    var done = assert.async();
    function onload(){
        var decodedMsgpack = decodeMsgpack( new Uint8Array( this.response ) );

        assert.equal( decodedMsgpack.pdbId, "1CRN", "Passed!" );
        assert.equal( decodedMsgpack.spaceGroup, "P 1 21 1", "Passed!" );
        assert.close( decodedMsgpack.unitCell[ 0 ], 40.959, 0.001, "Passed!" );
        assert.close( decodedMsgpack.unitCell[ 1 ], 18.649, 0.001, "Passed!" );
        assert.close( decodedMsgpack.unitCell[ 2 ], 22.520, 0.001, "Passed!" );
        assert.close( decodedMsgpack.unitCell[ 3 ], 90, 0.001, "Passed!" );
        assert.close( decodedMsgpack.unitCell[ 4 ], 90.769, 0.001, "Passed!" );
        assert.close( decodedMsgpack.unitCell[ 5 ], 90, 0.001, "Passed!" );
        assert.equal( decodedMsgpack.title, "WATER STRUCTURE OF A HYDROPHOBIC PROTEIN AT ATOMIC RESOLUTION. PENTAGON RINGS OF WATER MOLECULES IN CRYSTALS OF CRAMBIN", "Passed!" );

        assert.equal( decodedMsgpack.numBonds, 385, "Passed!" );
        assert.equal( decodedMsgpack.numAtoms, 327, "Passed!" );
        // assert.equal( decodedMsgpack.numGroups, 46, "Passed!" );
        // assert.equal( decodedMsgpack.numChains, 1, "Passed!" );
        // assert.equal( decodedMsgpack.numModels, 1, "Passed!" );

        assert.equal( Object.keys( decodedMsgpack.groupMap ).length, 16, "Passed!" );

        checkMsgpackFields( decodedMsgpack, assert );
        // checkMmtfConsistency( decodedMsgpack, assert );

        done();
    }
    function onerror(){
        done();
    }
    loadFile( "../data/1crn.mmtf", onload, onerror );
});

