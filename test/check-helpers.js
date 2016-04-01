
////////////
// helpers
//
function isObject( value ){
    return !!value && typeof value === 'object' && !Array.isArray( value );
}

function loadFile( url, onload, onerror ){
    var xhr = new XMLHttpRequest();
    xhr.addEventListener( "load", onload, true );
    xhr.addEventListener( "error", onerror, true );
    xhr.open( "GET", url, true );
    xhr.responseType = "arraybuffer";
    xhr.send();
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


//////////////////
// checks fields
//
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
        "macroMolecularSize", "transforms"
    ];
    var reqPartFields = [
        "chainIdList", "transformation"
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

function checkEntityListFields( entityList, assert ){
    var reqEntityFields = [
        "chainIndexList", "description", "type", "sequence"
    ];
    for( var i = 0, il = entityList.length; i < il; ++i ){
        var entity = entityList[ i ];
        checkDictFields(
            entity, reqEntityFields, [], "entity", assert
        );
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
        "resolution", "rFree", "rWork", "entityList",
        // counts

        // maps

        // bonds
        "bondAtomList", "bondOrderList",
        // atoms
        "bFactorBig", "bFactorSmall", "atomIdList", "altLabelList", "occList",
        // groups
        "secStructList", "insCodeList", "seqResIdList",
        // chains
        "chainNameList", "chainSeqList"
        // models

    ];
    checkDictFields(
        decodedMsgpack, reqTopLevelFields, optTopLevelFields, "topLevel", assert
    );

    checkGroupMapFields( decodedMsgpack.groupMap, assert );

    if( decodedMsgpack.bioAssembly !== undefined ){
        checkBioAssemblyFields( decodedMsgpack.bioAssembly, assert );
    }

    if( decodedMsgpack.entityList !== undefined ){
        checkEntityListFields( decodedMsgpack.entityList, assert );
    }
}

function checkMmtfFields( decodedMmtf, assert ){
    var reqTopLevelFields = [
        // meta
        "mmtfVersion", "mmtfProducer",
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
        "title", "pdbId", "bioAssembly", "unitCell", "spaceGroup", "experimentalMethods",
        "resolution", "rFree", "rWork", "entityList",
        // counts

        // stores

        // maps

    ];
    checkDictFields(
        decodedMmtf, reqTopLevelFields, optTopLevelFields, "topLevel", assert
    );

    checkGroupMapFields( decodedMmtf.groupMap, assert );

    if( decodedMmtf.bioAssembly !== undefined ){
        checkBioAssemblyFields( decodedMmtf.bioAssembly, assert );
    }

    if( decodedMmtf.entityList !== undefined ){
        checkEntityListFields( decodedMmtf.entityList, assert );
    }

    var reqBondStoreFields = [
        "atomIndex1", "atomIndex2", "bondOrder"
    ];
    checkDictFields(
        decodedMmtf.bondStore, reqBondStoreFields, [], "bondStore", assert
    );

    var reqAtomStoreFields = [
        "groupIndex", "xCoord", "yCoord", "zCoord", "bFactor",
        "atomId", "altLabel", "occupancy"
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
        "modelIndex", "groupOffset", "groupCount", "chainId"
    ];
    var optChainStoreFields = [
        "chainName"
    ];
    checkDictFields(
        decodedMmtf.chainStore, reqChainStoreFields, optChainStoreFields, "chainStore", assert
    );

    var reqModelStoreFields = [
        "chainOffset", "chainCount"
    ];
    checkDictFields(
        decodedMmtf.modelStore, reqModelStoreFields, [], "modelStore", assert
    );
}


////////////////
// check types
//
function checkCommonTypes( decodedDict, assert ){
    // meta
    assert.ok(
        typeof decodedDict.mmtfVersion === 'string',
        "mmtfVersion must be a string"
    );
    assert.ok(
        typeof decodedDict.mmtfProducer === 'string',
        "mmtfProducer must be a string"
    );

    // counts
    assert.ok(
        Number.isInteger( decodedDict.numBonds ),
        "numBonds must be an integer"
    );
    assert.ok(
        Number.isInteger( decodedDict.numAtoms ),
        "numAtoms must be an integer"
    );

    // maps
    assert.ok(
        isObject( decodedDict.groupMap ),
        "groupMap must be an object"
    );

    // header
    if( decodedDict.title !== undefined ){
        assert.ok(
            typeof decodedDict.title === 'string',
            "title must be a string"
        );
    }
    if( decodedDict.pdbId !== undefined ){
        assert.ok(
            typeof decodedDict.pdbId === 'string',
            "pdbId must be a string"
        );
    }
    if( decodedDict.bioAssembly !== undefined ){
        assert.ok(
            isObject( decodedDict.bioAssembly ),
            "when given, bioAssembly must be an object"
        );
    }
    if( decodedDict.unitCell !== undefined ){
        assert.ok(
            Array.isArray( decodedDict.unitCell ),
            "when given, unitCell must be an array"
        );
    }
    if( decodedDict.spaceGroup !== undefined ){
        assert.ok(
            typeof decodedDict.spaceGroup === 'string',
            "spaceGroup must be a string"
        );
    }
    if( decodedDict.entityList !== undefined ){
        assert.ok(
            Array.isArray( decodedDict.entityList ),
            "when given, entityList must be an array"
        );
    }

    if( decodedDict.experimentalMethods !== undefined ){
        assert.ok(
            Array.isArray( decodedDict.experimentalMethods ),
            "when given, experimentalMethods must be an array"
        );
    }
    if( decodedDict.resolution !== undefined ){
        assert.ok(
            typeof decodedDict.resolution === 'number',
            "resolution must be a float"
        );
    }
    if( decodedDict.rFree !== undefined ){
        assert.ok(
            typeof decodedDict.rFree === 'number',
            "rFree must be a float"
        );
    }
    if( decodedDict.rWork !== undefined ){
        assert.ok(
            typeof decodedDict.rWork === 'number',
            "rWork must be a float"
        );
    }
}

function checkMsgpackTypes( decodedMsgpack, assert ){
    checkCommonTypes( decodedMsgpack, assert );

    // atoms
    assert.ok(
        decodedMsgpack.xCoordBig instanceof Uint8Array,
        "xCoordBig must be a Uint8Array instance"
    );
    assert.ok(
        decodedMsgpack.xCoordSmall instanceof Uint8Array,
        "xCoordSmall must be a Uint8Array instance"
    );
    assert.ok(
        decodedMsgpack.yCoordBig instanceof Uint8Array,
        "yCoordBig must be a Uint8Array instance"
    );
    assert.ok(
        decodedMsgpack.yCoordSmall instanceof Uint8Array,
        "yCoordSmall must be a Uint8Array instance"
    );
    assert.ok(
        decodedMsgpack.zCoordBig instanceof Uint8Array,
        "zCoordBig must be a Uint8Array instance"
    );
    assert.ok(
        decodedMsgpack.zCoordSmall instanceof Uint8Array,
        "zCoordSmall must be a Uint8Array instance"
    );

    // groups
    assert.ok(
        decodedMsgpack.groupIdList instanceof Uint8Array,
        "groupIdList must be a Uint8Array instance"
    );
    assert.ok(
        decodedMsgpack.groupTypeList instanceof Uint8Array,
        "groupTypeList must be a Uint8Array instance"
    );

    // chains
    assert.ok(
        decodedMsgpack.chainIdList instanceof Uint8Array,
        "chainIdList must be a Uint8Array instance"
    );
    assert.ok(
        Array.isArray( decodedMsgpack.groupsPerChain ),
        "groupsPerChain must be an array"
    );

    // models
    assert.ok(
        Array.isArray( decodedMsgpack.chainsPerModel ),
        "chainsPerModel must be an array"
    );

    // bonds
    if( decodedMsgpack.bondAtomList !== undefined ){
        assert.ok(
            decodedMsgpack.bondAtomList instanceof Uint8Array,
            "bondAtomList must be a Uint8Array instance"
        );
    }
    if( decodedMsgpack.bondOrderList !== undefined ){
        assert.ok(
            decodedMsgpack.bondOrderList instanceof Uint8Array,
            "bondOrderList must be a Uint8Array instance"
        );
    }

    // atoms
    if( decodedMsgpack.bFactorBig !== undefined ){
        assert.ok(
            decodedMsgpack.bFactorBig instanceof Uint8Array,
            "bFactorBig must be a Uint8Array instance"
        );
    }
    if( decodedMsgpack.bFactorSmall !== undefined ){
        assert.ok(
            decodedMsgpack.bFactorSmall instanceof Uint8Array,
            "bFactorSmall must be a Uint8Array instance"
        );
    }

    if( decodedMsgpack.atomIdList !== undefined ){
        assert.ok(
            decodedMsgpack.atomIdList instanceof Uint8Array,
            "atomIdList must be a Uint8Array instance"
        );
    }
    if( decodedMsgpack.altLabelList !== undefined ){
        assert.ok(
            Array.isArray( decodedMsgpack.altLabelList ),
            "altLabelList must be an array"
        );
    }
    if( decodedMsgpack.occList !== undefined ){
        assert.ok(
            decodedMsgpack.occList instanceof Uint8Array,
            "occList must be a Uint8Array instance"
        );
    }

    // groups
    if( decodedMsgpack.secStructList !== undefined ){
        assert.ok(
            decodedMsgpack.secStructList instanceof Uint8Array,
            "secStructList must be a Uint8Array instance"
        );
    }
    if( decodedMsgpack.insCodeList !== undefined ){
        assert.ok(
            Array.isArray( decodedMsgpack.insCodeList ),
            "insCodeList must be an array"
        );
    }
    if( decodedMsgpack.seqResIdList !== undefined ){
        assert.ok(
            decodedMsgpack.seqResIdList instanceof Uint8Array,
            "seqResIdList must be a Uint8Array instance"
        );
    }

    // chains
    if( decodedMsgpack.chainNameList !== undefined ){
        assert.ok(
            decodedMsgpack.chainNameList instanceof Uint8Array,
            "chainNameList must be a Uint8Array instance"
        );
    }
    if( decodedMsgpack.chainSeqList !== undefined ){
        assert.ok(
            Array.isArray( decodedMsgpack.chainSeqList ),
            "chainSeqList must be an array"
        );
    }
}

function checkMmtfTypes( decodedMmtf, assert ){
    checkCommonTypes( decodedMmtf, assert )

    // counts
    assert.ok(
        Number.isInteger( decodedMmtf.numGroups ),
        "numGroups must be an integer"
    );
    assert.ok(
        Number.isInteger( decodedMmtf.numChains ),
        "numChains must be an integer"
    );
    assert.ok(
        Number.isInteger( decodedMmtf.numModels ),
        "numModels must be an integer"
    );

    // bonds
    if( decodedMmtf.bondStore.atomIndex1 !== undefined ){
        assert.ok(
            decodedMmtf.bondStore.atomIndex1 instanceof Uint32Array,
            "when given, atomIndex1 must be an Uint32Array instance"
        );
    }
    if( decodedMmtf.bondStore.atomIndex2 !== undefined ){
        assert.ok(
            decodedMmtf.bondStore.atomIndex2 instanceof Uint32Array,
            "when given, atomIndex2 must be an Uint32Array instance"
        );
    }
    if( decodedMmtf.bondStore.bondOrder !== undefined ){
        assert.ok(
            decodedMmtf.bondStore.bondOrder instanceof Uint8Array,
            "when given, bondOrder must be an Uint8Array instance"
        );
    }

    // atoms
    assert.ok(
        decodedMmtf.atomStore.groupIndex instanceof Uint32Array,
        "groupIndex must be an Uint32Array instance"
    );
    assert.ok(
        decodedMmtf.atomStore.xCoord instanceof Float32Array,
        "xCoord must be an Float32Array instance"
    );
    assert.ok(
        decodedMmtf.atomStore.yCoord instanceof Float32Array,
        "yCoord must be an Float32Array instance"
    );
    assert.ok(
        decodedMmtf.atomStore.zCoord instanceof Float32Array,
        "zCoord must be an Float32Array instance"
    );
    if( decodedMmtf.atomStore.bFactor !== undefined ){
        assert.ok(
            decodedMmtf.atomStore.bFactor instanceof Float32Array,
            "when given, bFactor must be an Float32Array instance"
        );
    }
    if( decodedMmtf.atomStore.atomId !== undefined ){
        assert.ok(
            decodedMmtf.atomStore.atomId instanceof Int32Array,
            "when given, atomId must be an Int32Array instance"
        );
    }
    if( decodedMmtf.atomStore.altLabel !== undefined ){
        assert.ok(
            decodedMmtf.atomStore.altLabel instanceof Uint8Array,
            "when given, altLabel must be an Uint8Array instance"
        );
    }
    if( decodedMmtf.atomStore.occupancy !== undefined ){
        assert.ok(
            decodedMmtf.atomStore.occupancy instanceof Float32Array,
            "when given, occupancy must be an Float32Array instance"
        );
    }

    // groups
    assert.ok(
        decodedMmtf.groupStore.chainIndex instanceof Uint32Array,
        "chainIndex must be an Uint32Array instance"
    );
    assert.ok(
        decodedMmtf.groupStore.atomOffset instanceof Uint32Array,
        "atomOffset must be an Uint32Array instance"
    );
    assert.ok(
        decodedMmtf.groupStore.atomCount instanceof Uint16Array,
        "atomCount must be an Uint16Array instance"
    );
    assert.ok(
        decodedMmtf.groupStore.groupTypeId instanceof Uint16Array,
        "groupTypeId must be an Uint16Array instance"
    );
    assert.ok(
        decodedMmtf.groupStore.groupId instanceof Int32Array,
        "groupId must be an Int32Array instance"
    );
    if( decodedMmtf.groupStore.secStruct !== undefined ){
        assert.ok(
            decodedMmtf.groupStore.secStruct instanceof Int8Array,
            "when given, secStruct must be an Int8Array instance"
        );
    }
    if( decodedMmtf.atomStore.insCode !== undefined ){
        assert.ok(
            decodedMmtf.atomStore.insCode instanceof Uint8Array,
            "when given, insCode must be an Uint8Array instance"
        );
    }

    // chains
    assert.ok(
        decodedMmtf.chainStore.modelIndex instanceof Uint16Array,
        "modelIndex must be an Uint16Array instance"
    );
    assert.ok(
        decodedMmtf.chainStore.groupOffset instanceof Uint32Array,
        "groupOffset must be an Uint32Array instance"
    );
    assert.ok(
        decodedMmtf.chainStore.groupCount instanceof Uint32Array,
        "groupCount must be an Uint32Array instance"
    );
    assert.ok(
        decodedMmtf.chainStore.chainId instanceof Uint8Array,
        "chainId must be an Uint8Array instance"
    );
    if( decodedMmtf.chainStore.chainName !== undefined ){
        assert.ok(
            decodedMmtf.chainStore.chainName instanceof Uint8Array,
            "when given, chainName must be an Uint8Array instance"
        );
    }

    // models
    assert.ok(
        decodedMmtf.modelStore.chainOffset instanceof Uint32Array,
        "chainOffset must be an Uint32Array instance"
    );
    assert.ok(
        decodedMmtf.modelStore.chainCount instanceof Uint32Array,
        "chainCount must be an Uint32Array instance"
    );
}


//////////////////////
// check consistency
//
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
    if( groupStore.insCode !== undefined ){
        assert.equal( groupStore.insCode.length, decodedMmtf.numGroups, "numGroups, insCode" );
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


/////////////////////
// check vocabulary
//
function checkCommonVocabulary( decodedDict, assert ){

    function toUpperCase( str ){
        return str.toUpperCase();
    }

    // experimentalMethods

    var knownExperimentalMethods = [
        "ELECTRON CRYSTALLOGRAPHY", "ELECTRON MICROSCOPY", "EPR", "FIBER DIFFRACTION",
        "FLUORESCENCE TRANSFER", "INFRARED SPECTROSCOPY", "NEUTRON DIFFRACTION",
        "POWDER DIFFRACTION", "SOLID-STATE NMR", "SOLUTION NMR", "SOLUTION SCATTERING",
        "THEORETICAL MODEL", "X-RAY DIFFRACTION"
    ].map( toUpperCase );

    if( decodedDict.experimentalMethods !== undefined ){
        decodedDict.experimentalMethods.forEach( function( method ){
            assert.ok(
                knownExperimentalMethods.indexOf( method.toUpperCase() ) !== -1,
                "unknown experimental method '" + method + "'"
            );
        } );
    }

    // groupType.chemCompType

    var knownChemCompTypes = [
        "D-beta-peptide", "C-gamma linking", "D-gamma-peptide", "C-delta linking",
        "D-peptide COOH carboxy terminus", "D-peptide NH3 amino terminus",
        "D-peptide linking", "D-saccharide", "D-saccharide 1,4 and 1,4 linking",
        "D-saccharide 1,4 and 1,6 linking", "DNA OH 3 prime terminus", "DNA OH 5 prime terminus",
        "DNA linking", "L-DNA linking", "L-RNA linking", "L-beta-peptide, C-gamma linking",
        "L-gamma-peptide, C-delta linking", "L-peptide COOH carboxy terminus",
        "L-peptide NH3 amino terminus", "L-peptide linking", "L-saccharide",
        "L-saccharide 1,4 and 1,4 linking", "L-saccharide 1,4 and 1,6 linking",
        "RNA OH 3 prime terminus", "RNA OH 5 prime terminus", "RNA linking",
        "non-polymer", "other", "peptide linking", "peptide-like", "saccharide"
    ].map( toUpperCase );

    for( var groupId in decodedDict.groupMap ){
        var groupType = decodedDict.groupMap[ groupId ];
        if( groupType.chemCompType !== "" ){
            assert.ok(
                knownChemCompTypes.indexOf( groupType.chemCompType.toUpperCase() ) !== -1,
                "unknown chemCompType '" + groupType.chemCompType + "'"
            );
        }
    }

    // entity.type

    var knownEntityTypes = [
        "macrolide", "non-polymer", "polymer", "water"
    ].map( toUpperCase );

    if( decodedDict.entityList ){
        decodedDict.entityList.forEach( function( entity ){
            if( entity.type !== "" ){
                assert.ok(
                    knownEntityTypes.indexOf( entity.type.toUpperCase() ) !== -1,
                    "unknown entity type '" + entity.type + "'"
                );
            }
        } );
    }

}

function checkMsgpackVocabulary( msgpackDict, assert ){
    checkCommonVocabulary( msgpackDict, assert );
}

function checkMmtfVocabulary( mmtfDict, assert ){
    checkCommonVocabulary( mmtfDict, assert );
}


//////////
// check
//
function checkMsgpack( msgpackDict, assert ){
    checkMsgpackFields( msgpackDict, assert );
    checkMsgpackTypes( msgpackDict, assert );
    checkMsgpackConsistency( msgpackDict, assert );
    checkMsgpackVocabulary( msgpackDict, assert );
}

function checkMmtf( mmtfDict, assert ){
    checkMmtfFields( mmtfDict, assert );
    checkMmtfTypes( mmtfDict, assert );
    checkMmtfConsistency( mmtfDict, assert );
    checkMmtfVocabulary( mmtfDict, assert );
}
