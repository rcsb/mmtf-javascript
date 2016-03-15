
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

function checkGroupMapFields( groupMap, assert ){
    var reqGroupTypeFields = [
        "atomCharges", "atomInfo", "bondIndices", "bondOrders",
        "groupName", "singleLetterCode", "chemCompType"
    ];
    for( var groupTypeId in groupMap ){
        var groupType = groupMap[ groupTypeId ];
        checkDictFields(
            groupType, reqGroupTypeFields, [], "groupType", assert
        );
    }
}

function checkBioAssemblyFields( bioAssembly, assert ){
    var reqAssemblyFields = [
        "id", "macromolecularSize", "transforms"
    ];
    var reqPartFields = [
        "id", "chainId", "transformation"
    ];
    for( var assemblyId in bioAssembly ){
        var assembly = bioAssembly[ assemblyId ];
        checkDictFields(
            assembly, reqAssemblyFields, [], "assembly", assert
        );
        for( var partId in assembly.transforms ){
            var part = assembly.transforms[ partId ];
            checkDictFields(
                part, reqPartFields, [], "part", assert
            );
        }
    }
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

    checkGroupMapFields( decodedMsgpack.groupMap, assert );

    checkBioAssemblyFields( decodedMsgpack.bioAssembly, assert );
}

function checkMmtfFields( decodedMmtf, assert ){
    var reqTopLevelFields = [
        // header

        // counts
        "numBonds", "numAtoms", "numGroups", "numChains", "numModels",
        // stores
        "bondStore", "atomStore", "groupStore", "chainStore", "modelStore",
        // maps
        "groupMap"
    ];
    var optTopLevelFields = [
        // header
        "unitCell", "spaceGroup", "bioAssembly", "pdbId", "title",
        // counts

        // stores

        // maps

    ];
    checkDictFields(
        decodedMmtf, reqTopLevelFields, optTopLevelFields, "topLevel", assert
    );

    checkGroupMapFields( decodedMmtf.groupMap, assert );

    checkBioAssemblyFields( decodedMmtf.bioAssembly, assert );

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

function checkGroupMapConsistency( groupMap, assert ){
    var groupTypeFields = [
        "atomCharges", "atomInfo", "bondIndices", "bondOrders"
    ];
    for( var groupId in groupMap ){
        var groupType = groupMap[ groupId ];
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
}

function getRunLengthSize( runLengthEncodedArray ){
    var fullLength = 0;
    for( var i = 0, il = runLengthEncodedArray.length; i < il; i+=2 ){
        fullLength += runLengthEncodedArray[ i + 1 ];
    }
    return fullLength;
}

function getSplitListSize( bigArray, smallArray ){
    return ( getInt32( bigArray ).length / 2 ) + getInt16( smallArray ).length;
}

function checkMsgpackConsistency( decodedMsgpack, assert ){
    // check consistency of groupMap entries
    checkGroupMapConsistency( decodedMsgpack.groupMap, assert );

    // check bond data sizes for consistency
    assert.equal( decodedMsgpack.bondAtomList.length/4, decodedMsgpack.bondOrderList.length*2, "bondAtomList, bondOrderList" );

    // atom data sizes
    assert.equal( getSplitListSize( decodedMsgpack.xCoordBig, decodedMsgpack.xCoordSmall ), decodedMsgpack.numAtoms, "numAtoms, xCoord" );
    assert.equal( getSplitListSize( decodedMsgpack.yCoordBig, decodedMsgpack.yCoordSmall ), decodedMsgpack.numAtoms, "numAtoms, yCoord" );
    assert.equal( getSplitListSize( decodedMsgpack.zCoordBig, decodedMsgpack.zCoordSmall ), decodedMsgpack.numAtoms, "numAtoms, zCoord" );
    if( decodedMsgpack.bFactorBig !== undefined ){
        assert.equal( getSplitListSize( decodedMsgpack.bFactorBig, decodedMsgpack.bFactorSmall ), decodedMsgpack.numAtoms, "numAtoms, bFactor" );
    }
    if( decodedMsgpack.atomIdList !== undefined ){
        assert.equal( getRunLengthSize( getInt32( decodedMsgpack.atomIdList ) ), decodedMsgpack.numAtoms, "numatoms, atomIdList" );
    }
    if( decodedMsgpack.altLabelList !== undefined ){
        assert.equal( getRunLengthSize( decodedMsgpack.altLabelList ), decodedMsgpack.numAtoms, "numatoms, altLabelList" );
    }
    if( decodedMsgpack.insCodeList !== undefined ){
        assert.equal( getRunLengthSize( decodedMsgpack.insCodeList ), decodedMsgpack.numAtoms, "numatoms, insCodeList" );
    }
    if( decodedMsgpack.occList !== undefined ){
        assert.equal( getRunLengthSize( getInt32( decodedMsgpack.occList ) ), decodedMsgpack.numAtoms, "numatoms, occList" );
    }

    // group data sizes
    var numGroups = decodedMsgpack.groupTypeList.length / 4;
    assert.equal( getRunLengthSize( getInt32( decodedMsgpack.groupIdList ) ), numGroups, "numGroups, groupIdList" );
    if( decodedMsgpack.secStructList !== undefined ){
        assert.equal( decodedMsgpack.secStructList.length, numGroups, "numGroups, secStructList" );
    }
    if( decodedMsgpack.seqResIdList !== undefined ){
        assert.equal( getRunLengthSize( getInt32( decodedMsgpack.seqResIdList ) ), numGroups, "numGroups, seqResIdList" );
    }

    // chain data sizes
    var numChains = decodedMsgpack.groupsPerChain.length;
    assert.equal( decodedMsgpack.chainIdList.length / 4, numChains, "numChains, chainIdList" );
    if( decodedMsgpack.chainNameList !== undefined ){
        assert.equal( decodedMsgpack.chainNameList.length / 4, numChains, "numChains, chainNameList" );
    }
    if( decodedMsgpack.chainSeqList !== undefined ){
        assert.equal( decodedMsgpack.chainSeqList.length, numChains, "numChains, chainSeqList" );
    }

}

function checkMmtfConsistency( decodedMmtf, assert ){
    // check consistency of groupMap entries
    checkGroupMapConsistency( decodedMmtf.groupMap, assert );

    // check sizes for consistency
    var bondStore = decodedMmtf.bondStore;
    assert.equal( bondStore.atomIndex1.length, decodedMmtf.numBonds + decodedMmtf.numGroups, "numBonds, atomIndex1" );
    assert.equal( bondStore.atomIndex2.length, decodedMmtf.numBonds + decodedMmtf.numGroups, "numBonds, atomIndex2" );
    assert.equal( bondStore.bondOrder.length, decodedMmtf.numBonds + decodedMmtf.numGroups, "numBonds, bondOrder" );

    var atomStore = decodedMmtf.atomStore;
    assert.equal( atomStore.groupIndex.length, decodedMmtf.numAtoms, "numAtoms, groupIndex" );
    assert.equal( atomStore.xCoord.length, decodedMmtf.numAtoms, "numAtoms, xCoord" );
    assert.equal( atomStore.yCoord.length, decodedMmtf.numAtoms, "numAtoms, yCoord" );
    assert.equal( atomStore.zCoord.length, decodedMmtf.numAtoms, "numAtoms, zCoord" );
    if( atomStore.bFactor ){
        assert.equal( atomStore.bFactor.length, decodedMmtf.numAtoms, "numAtoms, bFactor" );
    }
    if( atomStore.atomId !== undefined ){
        assert.equal( atomStore.atomId.length, decodedMmtf.numAtoms, "numAtoms, atomId" );
    }
    if( atomStore.altLabel !== undefined ){
        assert.equal( atomStore.altLabel.length, decodedMmtf.numAtoms, "numAtoms, altLabel" );
    }
    if( atomStore.insCode !== undefined ){
        assert.equal( atomStore.insCode.length, decodedMmtf.numAtoms, "numAtoms, insCode" );
    }
    if( atomStore.occupancy !== undefined ){
        assert.equal( atomStore.occupancy.length, decodedMmtf.numAtoms, "numAtoms, occupancy" );
    }

    var groupStore = decodedMmtf.groupStore;
    assert.equal( groupStore.chainIndex.length, decodedMmtf.numGroups, "numGroups, chainIndex" );
    assert.equal( groupStore.atomOffset.length, decodedMmtf.numGroups, "numGroups, atomOffset" );
    assert.equal( groupStore.atomCount.length, decodedMmtf.numGroups, "numGroups, atomCount" );
    assert.equal( groupStore.groupTypeId.length, decodedMmtf.numGroups, "numGroups, groupTypeId" );
    assert.equal( groupStore.groupId.length, decodedMmtf.numGroups, "numGroups, groupId" );
    if( groupStore.secStruct !== undefined ){
        assert.equal( groupStore.secStruct.length, decodedMmtf.numGroups, "numGroups, secStruct" );
    }

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

QUnit.test( "decode mmtf 1crn full", function( assert ) {
    var done = assert.async();
    function onload(){
        var decodedMmtf = decodeMmtf( this.response );

        assert.equal( decodedMmtf.pdbId, "1CRN", "Wrong PDB ID" );
        assert.equal( decodedMmtf.spaceGroup, "P 1 21 1", "Wrong spacegroup" );
        assert.close( decodedMmtf.unitCell[ 0 ], 40.959, 0.001, "Wrong unitcell a length" );
        assert.close( decodedMmtf.unitCell[ 1 ], 18.649, 0.001, "Wrong unitcell b length" );
        assert.close( decodedMmtf.unitCell[ 2 ], 22.520, 0.001, "Wrong unitcell c length" );
        assert.close( decodedMmtf.unitCell[ 3 ], 90, 0.001, "Wrong unitcell alpha angle" );
        assert.close( decodedMmtf.unitCell[ 4 ], 90.769, 0.001, "Wrong unitcell beta angle" );
        assert.close( decodedMmtf.unitCell[ 5 ], 90, 0.001, "Wrong unitcell gamma angle" );
        assert.equal( decodedMmtf.title, "WATER STRUCTURE OF A HYDROPHOBIC PROTEIN AT ATOMIC RESOLUTION. PENTAGON RINGS OF WATER MOLECULES IN CRYSTALS OF CRAMBIN", "Wrong title" );

        assert.equal( decodedMmtf.numBonds, 385,  "Wrong number of bonds" );
        assert.equal( decodedMmtf.numAtoms, 327,  "Wrong number of atoms" );
        assert.equal( decodedMmtf.numGroups, 46,  "Wrong number of groups" );
        assert.equal( decodedMmtf.numChains, 1,  "Wrong number of chains" );
        assert.equal( decodedMmtf.numModels, 1,  "Wrong number of models" );

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

QUnit.test( "decode msgpack 1crn full", function( assert ) {
    var done = assert.async();
    function onload(){
        var decodedMsgpack = decodeMsgpack( new Uint8Array( this.response ) );

        assert.equal( decodedMsgpack.pdbId, "1CRN", "Wrong PDB ID" );
        assert.equal( decodedMsgpack.spaceGroup, "P 1 21 1", "Wrong spacegroup" );
        assert.close( decodedMsgpack.unitCell[ 0 ], 40.959, 0.001, "Wrong unitcell a length" );
        assert.close( decodedMsgpack.unitCell[ 1 ], 18.649, 0.001, "Wrong unitcell b length" );
        assert.close( decodedMsgpack.unitCell[ 2 ], 22.520, 0.001, "Wrong unitcell c length" );
        assert.close( decodedMsgpack.unitCell[ 3 ], 90, 0.001, "Wrong unitcell alpha angle" );
        assert.close( decodedMsgpack.unitCell[ 4 ], 90.769, 0.001, "Wrong unitcell beta angle" );
        assert.close( decodedMsgpack.unitCell[ 5 ], 90, 0.001, "Wrong unitcell gamma angle" );
        assert.equal( decodedMsgpack.title, "WATER STRUCTURE OF A HYDROPHOBIC PROTEIN AT ATOMIC RESOLUTION. PENTAGON RINGS OF WATER MOLECULES IN CRYSTALS OF CRAMBIN", "Wrong title" );

        assert.equal( decodedMsgpack.numBonds, 385, "Wrong number of bonds" );
        assert.equal( decodedMsgpack.numAtoms, 327, "Wrong number of atoms" );
        assert.equal( decodedMsgpack.groupTypeList.length / 4, 46, "Wrong number of groups" );
        assert.equal( decodedMsgpack.groupsPerChain.length, 1, "Wrong number of chains" );
        assert.equal( decodedMsgpack.chainsPerModel.length, 1, "Wrong number of models" );

        assert.equal( Object.keys( decodedMsgpack.groupMap ).length, 16, "Wrong number of groupMap entries" );

        checkMsgpackFields( decodedMsgpack, assert );
        checkMsgpackConsistency( decodedMsgpack, assert );

        done();
    }
    function onerror(){
        done();
    }
    loadFile( "../data/1crn.mmtf", onload, onerror );
});


// curl http://mmtf.rcsb.org/full/1d66 -o data/1d66.mmtf.gz
// gzip -df data/1d66.mmtf.gz

QUnit.test( "decode mmtf 1d66 full", function( assert ) {
    var done = assert.async();
    function onload(){
        var decodedMmtf = decodeMmtf( this.response );

        assert.equal( decodedMmtf.pdbId, "1D66", "Wrong PDB ID" );

        assert.equal( decodedMmtf.numBonds, 1888,  "Wrong number of bonds" );
        assert.equal( decodedMmtf.numAtoms, 1762,  "Wrong number of atoms" );
        assert.equal( decodedMmtf.numGroups, 207,  "Wrong number of groups" );
        assert.equal( decodedMmtf.numChains, 12,  "Wrong number of chains" );
        assert.equal( decodedMmtf.numModels, 1,  "Wrong number of models" );

        assert.equal( Object.keys( decodedMmtf.groupMap ).length, 24, "Wrong number of groupMap entries" );

        checkMmtfFields( decodedMmtf, assert );
        checkMmtfConsistency( decodedMmtf, assert );

        done();
    }
    function onerror(){
        done();
    }
    loadFile( "../data/1d66.mmtf", onload, onerror );
});

QUnit.test( "decode msgpack 1d66 full", function( assert ) {
    var done = assert.async();
    function onload(){
        var decodedMsgpack = decodeMsgpack( new Uint8Array( this.response ) );

        assert.equal( decodedMsgpack.pdbId, "1D66", "Wrong PDB ID" );

        assert.equal( decodedMsgpack.numBonds, 1888, "Wrong number of bonds" );
        assert.equal( decodedMsgpack.numAtoms, 1762, "Wrong number of atoms" );
        assert.equal( decodedMsgpack.groupTypeList.length / 4, 207, "Wrong number of groups" );
        assert.equal( decodedMsgpack.groupsPerChain.length, 12, "Wrong number of chains" );
        assert.equal( decodedMsgpack.chainsPerModel.length, 1, "Wrong number of models" );

        assert.equal( Object.keys( decodedMsgpack.groupMap ).length, 24, "Wrong number of groupMap entries" );

        checkMsgpackFields( decodedMsgpack, assert );
        checkMsgpackConsistency( decodedMsgpack, assert );

        done();
    }
    function onerror(){
        done();
    }
    loadFile( "../data/1d66.mmtf", onload, onerror );
});


// curl http://mmtf.rcsb.org/backbone/1d66 -o data/1d66.bb.mmtf.gz
// gzip -df data/1d66.bb.mmtf.gz

// QUnit.test( "decode mmtf 1d66 backbone", function( assert ) {
//     var done = assert.async();
//     function onload(){
//         var decodedMmtf = decodeMmtf( this.response );

//         assert.equal( decodedMmtf.pdbId, "1D66", "Wrong PDB ID" );

//         assert.equal( decodedMmtf.numBonds, 0,  "Wrong number of bonds" );
//         assert.equal( decodedMmtf.numAtoms, 154,  "Wrong number of atoms" );
//         assert.equal( decodedMmtf.numGroups, 154,  "Wrong number of groups" );
//         assert.equal( decodedMmtf.numChains, 4,  "Wrong number of chains" );
//         assert.equal( decodedMmtf.numModels, 1,  "Wrong number of models" );

//         assert.equal( Object.keys( decodedMmtf.groupMap ).length, 22, "Wrong number of groupMap entries" );

//         checkMmtfFields( decodedMmtf, assert );
//         checkMmtfConsistency( decodedMmtf, assert );

//         done();
//     }
//     function onerror(){
//         done();
//     }
//     loadFile( "../data/1d66.bb.mmtf", onload, onerror );
// });

// QUnit.test( "decode msgpack 1d66 backbone", function( assert ) {
//     var done = assert.async();
//     function onload(){
//         var decodedMsgpack = decodeMsgpack( new Uint8Array( this.response ) );

//         assert.equal( decodedMsgpack.pdbId, "1D66", "Wrong PDB ID" );

//         assert.equal( decodedMsgpack.numBonds, 0, "Wrong number of bonds" );
//         assert.equal( decodedMsgpack.numAtoms, 154, "Wrong number of atoms" );
//         assert.equal( decodedMsgpack.groupTypeList.length / 4, 46, "Wrong number of groups" );
//         assert.equal( decodedMsgpack.groupsPerChain.length, 1, "Wrong number of chains" );
//         assert.equal( decodedMsgpack.chainsPerModel.length, 1, "Wrong number of models" );

//         assert.equal( Object.keys( decodedMsgpack.groupMap ).length, 24, "Wrong number of groupMap entries" );

//         checkMsgpackFields( decodedMsgpack, assert );
//         checkMsgpackConsistency( decodedMsgpack, assert );

//         done();
//     }
//     function onerror(){
//         done();
//     }
//     loadFile( "../data/1d66.bb.mmtf", onload, onerror );
// });
