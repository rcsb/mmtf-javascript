
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

function getSplitListSize( bigArray, smallArray, littleEndian ){
    return (
    	( getInt32( bigArray, undefined, littleEndian ).length / 2 ) +
    	getInt16( smallArray, undefined, littleEndian ).length
	)
}

function isDate( str ){
    return (
        str.length === 10 &&
        str[4] === "-" &&
        str[7] === "-" &&
        Number.isInteger( parseInt( str.substr( 0, 4 ) ) ) &&
        Number.isInteger( parseInt( str.substr( 5, 2 ) ) ) &&
        Number.isInteger( parseInt( str.substr( 8, 2 ) ) )
    );
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

function checkGroupListFields( groupList, assert ){
    var reqGroupTypeFields = [
        "atomCharges", "atomInfo", "bondIndices", "bondOrders",
        "groupName", "singleLetterCode", "chemCompType"
    ];
    groupList.forEach( function( groupType ){
        checkDictFields(
            groupType, reqGroupTypeFields, [], "groupType", assert
        );
    } );
}

function checkBioAssemblyFields( bioAssemblyList, assert ){
    var reqAssemblyFields = [
        "transforms"
    ];
    var reqPartFields = [
        "chainIndexList", "transformation"
    ];
    bioAssemblyList.forEach( function( assembly ){
        checkDictFields(
            assembly, reqAssemblyFields, [], "assembly", assert
        );
        for( var partId in assembly.transforms ){
            var part = assembly.transforms[ partId ];
            checkDictFields(
                part, reqPartFields, [], "part", assert
            );
        }
    } );
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
        // lists
        "groupList",
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
        "title", "structureId", "bioAssemblyList", "unitCell", "spaceGroup", "experimentalMethods",
        "depositionDate", "releaseDate", "resolution", "rFree", "rWork", "entityList",
        // counts

        // lists

        // bonds
        "bondAtomList", "bondOrderList",
        // atoms
        "bFactorBig", "bFactorSmall", "atomIdList", "altLocList", "occupancyList",
        // groups
        "secStructList", "insCodeList", "sequenceIndexList",
        // chains
        "chainNameList", "chainSeqList"
        // models

    ];
    checkDictFields(
        decodedMsgpack, reqTopLevelFields, optTopLevelFields, "topLevel", assert
    );

    checkGroupListFields( decodedMsgpack.groupList, assert );

    if( decodedMsgpack.bioAssemblyList !== undefined ){
        checkBioAssemblyFields( decodedMsgpack.bioAssemblyList, assert );
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
        // lists
        "groupList",
        // bonds

        // atoms
        "xCoordList", "yCoordList", "zCoordList",
        // groups
        "groupIdList", "groupTypeList",
        // chains
        "chainIdList", "groupsPerChain",
        // models
        "chainsPerModel"
    ];
    var optTopLevelFields = [
        // header
        "title", "structureId", "bioAssemblyList", "unitCell", "spaceGroup", "experimentalMethods",
        "depositionDate", "releaseDate", "resolution", "rFree", "rWork", "entityList",
        // counts

        // lists

        // bonds
        "bondAtomList", "bondOrderList",
        // atoms
        "bFactorList", "atomIdList", "altLocList", "occupancyList",
        // groups
        "secStructList", "insCodeList", "sequenceIndexList",
        // chains
        "chainNameList", "chainSeqList"
        // models

    ];
    checkDictFields(
        decodedMmtf, reqTopLevelFields, optTopLevelFields, "topLevel", assert
    );

    checkGroupListFields( decodedMmtf.groupList, assert );

    if( decodedMmtf.bioAssemblyList !== undefined ){
        checkBioAssemblyFields( decodedMmtf.bioAssemblyList, assert );
    }

    if( decodedMmtf.entityList !== undefined ){
        checkEntityListFields( decodedMmtf.entityList, assert );
    }
}


////////////////
// check types
//
function checkGroupListTypes( groupList, assert ){
    var regexpElement = /^[A-Z]{1,1}[a-z]{0,2}|$/;
    var regexpAtomname = /^.{0,5}$/;
    var regexpGroupname = /^.{0,5}$/;
    var regexpSingleLetter = /^[A-Z]{1,1}$/;
    groupList.forEach( function( groupType ){
        assert.ok(
            Array.isArray( groupType.atomCharges ),
            "groupType.atomCharges must be an array"
        );
        for( var i = 0, il = groupType.atomCharges.length; i < il; ++i ){
            assert.ok(
                Number.isInteger( groupType.atomCharges[ i ] ),
                "groupType.atomInfo atomnames must be integers"
            );
        }
        assert.ok(
            Array.isArray( groupType.atomInfo ),
            "groupType.atomInfo must be an array"
        );
        for( var i = 0, il = groupType.atomInfo.length; i < il; i += 2 ){
            assert.ok(
                typeof groupType.atomInfo[ i ] === 'string',
                "groupType.atomInfo elements must be strings"
            );
            assert.ok(
                regexpElement.test( groupType.atomInfo[ i ] ),
                "groupType.atomInfo elements must match /^[A-Z]{1,1}[a-z]{0,2}|$/"
            );
            assert.ok(
                typeof groupType.atomInfo[ i + 1 ] === 'string',
                "groupType.atomInfo atomnames must be strings"
            );
            assert.ok(
                regexpAtomname.test( groupType.atomInfo[ i + 1 ] ),
                "groupType.atomInfo atomnames must match /^.{0,5}$/"
            );
        }
        assert.ok(
            Array.isArray( groupType.bondIndices ),
            "groupType.bondIndices must be an array"
        );
        for( var i = 0, il = groupType.bondIndices.length; i < il; ++i ){
            assert.ok(
                Number.isInteger( groupType.bondIndices[ i ] ),
                "groupType.bondIndices must be integers"
            );
        }
        assert.ok(
            Array.isArray( groupType.bondOrders ),
            "groupType.bondOrders must be an array"
        );
        for( var i = 0, il = groupType.bondOrders.length; i < il; ++i ){
            assert.ok(
                Number.isInteger( groupType.bondOrders[ i ] ),
                "groupType.bondOrders must be integers"
            );
            assert.ok(
                groupType.bondOrders[ i ] >= 1 && groupType.bondOrders[ i ] <= 3,
                "groupType.bondOrders must be between 1 and 3"
            );
        }
        assert.ok(
            typeof groupType.groupName === 'string',
            "groupType.groupName must be a string"
        );
        assert.ok(
            regexpAtomname.test( groupType.groupName ),
            "groupType.groupName must match /^.{0,5}$/"
        );
        assert.ok(
            typeof groupType.singleLetterCode === 'string',
            "groupType.singleLetterCode must be a string"
        );
        assert.ok(
            regexpSingleLetter.test( groupType.singleLetterCode ),
            "groupType.singleLetterCode must match /^[A-Z]{1,1}$/"
        );
        assert.ok(
            typeof groupType.chemCompType === 'string',
            "groupType.chemCompType must be a string"
        );
    } );
}

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

    // lists
    assert.ok(
        Array.isArray( decodedDict.groupList ),
        "groupList must be an array"
    );
    checkGroupListTypes( decodedDict.groupList, assert );

    // header
    if( decodedDict.title !== undefined ){
        assert.ok(
            typeof decodedDict.title === 'string',
            "title must be a string"
        );
    }
    if( decodedDict.depositionDate !== undefined ){
        assert.ok(
            typeof decodedDict.depositionDate === 'string',
            "depositionDate must be a string"
        );
        assert.ok(
            isDate( decodedDict.depositionDate ),
            "depositionDate must be formated as YYYY-MM-DD"
        );
    }
    if( decodedDict.releaseDate !== undefined ){
        assert.ok(
            typeof decodedDict.releaseDate === 'string',
            "releaseDate must be a string"
        );
        assert.ok(
            isDate( decodedDict.releaseDate ),
            "releaseDate must be formated as YYYY-MM-DD"
        );
    }
    if( decodedDict.structureId !== undefined ){
        assert.ok(
            typeof decodedDict.structureId === 'string',
            "structureId must be a string"
        );
    }
    if( decodedDict.bioAssemblyList !== undefined ){
        assert.ok(
            Array.isArray( decodedDict.bioAssemblyList ),
            "when given, bioAssemblyList must be an array"
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

    // chains
    assert.ok(
        Array.isArray( decodedDict.groupsPerChain ),
        "groupsPerChain must be an array"
    );

    // models
    assert.ok(
        Array.isArray( decodedDict.chainsPerModel ),
        "chainsPerModel must be an array"
    );
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

    // bonds
    if( decodedMsgpack.bondAtomList !== undefined ){
        assert.ok(
            decodedMsgpack.bondAtomList instanceof Uint8Array,
            "when given, bondAtomList must be a Uint8Array instance"
        );
    }
    if( decodedMsgpack.bondOrderList !== undefined ){
        assert.ok(
            decodedMsgpack.bondOrderList instanceof Uint8Array,
            "when given, bondOrderList must be a Uint8Array instance"
        );
    }

    // atoms
    if( decodedMsgpack.bFactorBig !== undefined ){
        assert.ok(
            decodedMsgpack.bFactorBig instanceof Uint8Array,
            "when given, bFactorBig must be a Uint8Array instance"
        );
    }
    if( decodedMsgpack.bFactorSmall !== undefined ){
        assert.ok(
            decodedMsgpack.bFactorSmall instanceof Uint8Array,
            "when given, bFactorSmall must be a Uint8Array instance"
        );
    }

    if( decodedMsgpack.atomIdList !== undefined ){
        assert.ok(
            decodedMsgpack.atomIdList instanceof Uint8Array,
            "when given, atomIdList must be a Uint8Array instance"
        );
    }
    if( decodedMsgpack.altLocList !== undefined ){
        assert.ok(
            Array.isArray( decodedMsgpack.altLocList ),
            "when given, altLocList must be an array"
        );
    }
    if( decodedMsgpack.occupancyList !== undefined ){
        assert.ok(
            decodedMsgpack.occupancyList instanceof Uint8Array,
            "when given, occupancyList must be a Uint8Array instance"
        );
    }

    // groups
    if( decodedMsgpack.secStructList !== undefined ){
        assert.ok(
            decodedMsgpack.secStructList instanceof Uint8Array,
            "when given, secStructList must be a Uint8Array instance"
        );
    }
    if( decodedMsgpack.insCodeList !== undefined ){
        assert.ok(
            Array.isArray( decodedMsgpack.insCodeList ),
            "when given, insCodeList must be an array"
        );
    }
    if( decodedMsgpack.sequenceIndexList !== undefined ){
        assert.ok(
            decodedMsgpack.sequenceIndexList instanceof Uint8Array,
            "when given, sequenceIndexList must be a Uint8Array instance"
        );
    }

    // chains
    if( decodedMsgpack.chainNameList !== undefined ){
        assert.ok(
            decodedMsgpack.chainNameList instanceof Uint8Array,
            "when given, chainNameList must be a Uint8Array instance"
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
    if( decodedMmtf.bondAtomList !== undefined ){
        assert.ok(
            decodedMmtf.bondAtomList instanceof Int32Array,
            "bondAtomList must be a Int32Array instance"
        );
    }
    if( decodedMmtf.bondOrderList !== undefined ){
        assert.ok(
            decodedMmtf.bondOrderList instanceof Uint8Array,
            "bondOrderList must be a Uint8Array instance"
        );
    }

    // atoms
    assert.ok(
        decodedMmtf.xCoordList instanceof Float32Array,
        "xCoordList must be an Float32Array instance"
    );
    assert.ok(
        decodedMmtf.yCoordList instanceof Float32Array,
        "yCoordList must be an Float32Array instance"
    );
    assert.ok(
        decodedMmtf.zCoordList instanceof Float32Array,
        "zCoordList must be an Float32Array instance"
    );
    if( decodedMmtf.bFactorList !== undefined ){
        assert.ok(
            decodedMmtf.bFactorList instanceof Float32Array,
            "when given, bFactorList must be an Float32Array instance"
        );
    }
    if( decodedMmtf.atomIdList !== undefined ){
        assert.ok(
            decodedMmtf.atomIdList instanceof Int32Array,
            "when given, atomIdList must be an Int32Array instance"
        );
    }
    if( decodedMmtf.altLocList !== undefined ){
        assert.ok(
            decodedMmtf.altLocList instanceof Uint8Array,
            "when given, altLocList must be an Uint8Array instance"
        );
    }
    if( decodedMmtf.occupancyList !== undefined ){
        assert.ok(
            decodedMmtf.occupancyList instanceof Float32Array,
            "when given, occupancyList must be an Float32Array instance"
        );
    }

    // groups
    assert.ok(
        decodedMmtf.groupIdList instanceof Int32Array,
        "groupIdList must be an Int32Array instance"
    );
    assert.ok(
        decodedMmtf.groupTypeList instanceof Int32Array,
        "groupTypeList must be an Int32Array instance"
    );
    if( decodedMmtf.secStructList !== undefined ){
        assert.ok(
            decodedMmtf.secStructList instanceof Int8Array,
            "when given, secStructList must be an Int8Array instance"
        );
    }
    if( decodedMmtf.insCodeList !== undefined ){
        assert.ok(
            decodedMmtf.insCodeList instanceof Uint8Array,
            "when given, insCodeList must be an Uint8Array instance"
        );
    }
    if( decodedMmtf.sequenceIndexList !== undefined ){
        assert.ok(
            decodedMmtf.sequenceIndexList instanceof Int32Array,
            "when given, sequenceIndexList must be a Int32Array instance"
        );
    }

    // chains
    assert.ok(
        decodedMmtf.chainIdList instanceof Uint8Array,
        "chainIdList must be an Uint8Array instance"
    );
    if( decodedMmtf.chainNameList !== undefined ){
        assert.ok(
            decodedMmtf.chainNameList instanceof Uint8Array,
            "when given, chainNameList must be an Uint8Array instance"
        );
    }
}


//////////////////////
// check consistency
//
function checkGroupListConsistency( groupList, assert ){
    var groupTypeFields = [
        "atomCharges", "atomInfo", "bondIndices", "bondOrders"
    ];
    groupList.forEach( function( groupType ){
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
    } );
}

function checkMsgpackConsistency( decodedMsgpack, assert, littleEndian ){
    // check consistency of groupList entries
    checkGroupListConsistency( decodedMsgpack.groupList, assert );

    // check bond data sizes for consistency
    if( decodedMsgpack.bondAtomList !== undefined && decodedMsgpack.bondOrderList !== undefined ){
    	assert.equal( decodedMsgpack.bondAtomList.length/4, decodedMsgpack.bondOrderList.length*2, "bondAtomList, bondOrderList" );
    }

    // atom data sizes
    assert.equal( getSplitListSize( decodedMsgpack.xCoordBig, decodedMsgpack.xCoordSmall, littleEndian ), decodedMsgpack.numAtoms, "numAtoms, xCoord" );
    assert.equal( getSplitListSize( decodedMsgpack.yCoordBig, decodedMsgpack.yCoordSmall, littleEndian ), decodedMsgpack.numAtoms, "numAtoms, yCoord" );
    assert.equal( getSplitListSize( decodedMsgpack.zCoordBig, decodedMsgpack.zCoordSmall, littleEndian ), decodedMsgpack.numAtoms, "numAtoms, zCoord" );
    if( decodedMsgpack.bFactorBig !== undefined ){
        assert.equal( getSplitListSize( decodedMsgpack.bFactorBig, decodedMsgpack.bFactorSmall, littleEndian ), decodedMsgpack.numAtoms, "numAtoms, bFactor" );
    }
    if( decodedMsgpack.atomIdList !== undefined ){
        assert.equal( getRunLengthSize( getInt32( decodedMsgpack.atomIdList, undefined, littleEndian ) ), decodedMsgpack.numAtoms, "numatoms, atomIdList" );
    }
    if( decodedMsgpack.altLocList !== undefined ){
        assert.equal( getRunLengthSize( decodedMsgpack.altLocList ), decodedMsgpack.numAtoms, "numatoms, altLocList" );
    }
    if( decodedMsgpack.occupancyList !== undefined ){
        assert.equal( getRunLengthSize( getInt32( decodedMsgpack.occupancyList, undefined, littleEndian ) ), decodedMsgpack.numAtoms, "numatoms, occupancyList" );
    }

    // group data sizes
    var numGroups = decodedMsgpack.groupTypeList.length / 4;
    assert.equal( getRunLengthSize( getInt32( decodedMsgpack.groupIdList, undefined, littleEndian ) ), numGroups, "numGroups, groupIdList" );
    if( decodedMsgpack.insCodeList !== undefined ){
        assert.equal( getRunLengthSize( decodedMsgpack.insCodeList ), numGroups, "numgroups, insCodeList" );
    }
    if( decodedMsgpack.secStructList !== undefined ){
        assert.equal( decodedMsgpack.secStructList.length, numGroups, "numGroups, secStructList" );
    }
    if( decodedMsgpack.sequenceIndexList !== undefined ){
        assert.equal( getRunLengthSize( getInt32( decodedMsgpack.sequenceIndexList, undefined, littleEndian ) ), numGroups, "numGroups, sequenceIndexList" );
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
    // check consistency of groupList entries
    checkGroupListConsistency( decodedMmtf.groupList, assert );

    // check sizes for consistency
    assert.equal( decodedMmtf.xCoordList.length, decodedMmtf.numAtoms, "numAtoms, xCoordList" );
    assert.equal( decodedMmtf.yCoordList.length, decodedMmtf.numAtoms, "numAtoms, yCoordList" );
    assert.equal( decodedMmtf.zCoordList.length, decodedMmtf.numAtoms, "numAtoms, zCoordList" );
    if( decodedMmtf.bFactorList !== undefined ){
        assert.equal( decodedMmtf.bFactorList.length, decodedMmtf.numAtoms, "numAtoms, bFactorList" );
    }
    if( decodedMmtf.atomIdList !== undefined ){
        assert.equal( decodedMmtf.atomIdList.length, decodedMmtf.numAtoms, "numAtoms, atomIdList" );
    }
    if( decodedMmtf.altLocList !== undefined ){
        assert.equal( decodedMmtf.altLocList.length, decodedMmtf.numAtoms, "numAtoms, altLocList" );
    }
    if( decodedMmtf.occupancyList !== undefined ){
        assert.equal( decodedMmtf.occupancyList.length, decodedMmtf.numAtoms, "numAtoms, occupancyList" );
    }

    assert.equal( decodedMmtf.groupTypeList.length, decodedMmtf.numGroups, "numGroups, groupTypeList" );
    assert.equal( decodedMmtf.groupIdList.length, decodedMmtf.numGroups, "numGroups, groupIdList" );
    if( decodedMmtf.secStructList !== undefined ){
        assert.equal( decodedMmtf.secStructList.length, decodedMmtf.numGroups, "numGroups, secStructList" );
    }
    if( decodedMmtf.insCodeList !== undefined ){
        assert.equal( decodedMmtf.insCodeList.length, decodedMmtf.numGroups, "numGroups, insCodeList" );
    }
    if( decodedMmtf.sequenceIndexList !== undefined ){
        assert.equal( decodedMmtf.sequenceIndexList.length, decodedMmtf.numGroups, "numGroups, sequenceIndexList" );
    }

    assert.equal( decodedMmtf.chainIdList.length, decodedMmtf.numChains * 4, "numChains, chainIdList" );
    if( decodedMmtf.chainNameList !== undefined ){
    	assert.equal( decodedMmtf.chainNameList.length, decodedMmtf.numChains * 4, "numChains, chainNameList" );
    }
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

    decodedDict.groupList.forEach( function( groupType ){
        if( groupType.chemCompType !== "" ){
            assert.ok(
                knownChemCompTypes.indexOf( groupType.chemCompType.toUpperCase() ) !== -1,
                "unknown chemCompType '" + groupType.chemCompType + "'"
            );
        }
    } );

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
function checkMsgpack( msgpackDict, assert, littleEndian ){
    checkMsgpackFields( msgpackDict, assert );
    checkMsgpackTypes( msgpackDict, assert );
    checkMsgpackConsistency( msgpackDict, assert, littleEndian );
    checkMsgpackVocabulary( msgpackDict, assert );
}

function checkMmtf( mmtfDict, assert ){
    checkMmtfFields( mmtfDict, assert );
    checkMmtfTypes( mmtfDict, assert );
    checkMmtfConsistency( mmtfDict, assert );
    checkMmtfVocabulary( mmtfDict, assert );
}
