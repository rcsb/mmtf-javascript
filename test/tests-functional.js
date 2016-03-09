
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

function checkConsistency( decodedMmtf, assert ){
    // check consistency of groupMap entries
    var groupTypeFields = [
        "atomCharges", "atomInfo", "bondIndices", "bondOrders", "hetFlag"
    ];
    for( var groupId in decodedMmtf.groupMap ){
        var groupType = decodedMmtf.groupMap[ groupId ];
        groupTypeFields.forEach( function( name ){
            assert.ok( groupType[ name ] !== undefined, "Passed!" );
        } );
        assert.ok( groupType.atomCharges.length * 2 === groupType.atomInfo.length, "Passed!" );
        assert.ok( groupType.bondOrders.length * 2 === groupType.bondIndices.length, "Passed!" );
    }

    // check sizes for consistency
    var bondStore = decodedMmtf.bondStore;
    assert.equal( bondStore.atomIndex1.length, decodedMmtf.numBonds + decodedMmtf.numGroups, "Passed!" );
    assert.equal( bondStore.atomIndex2.length, decodedMmtf.numBonds + decodedMmtf.numGroups, "Passed!" );
    assert.equal( bondStore.bondOrder.length, decodedMmtf.numBonds + decodedMmtf.numGroups, "Passed!" );

    var atomStore = decodedMmtf.atomStore;
    assert.equal( atomStore.groupIndex.length, decodedMmtf.numAtoms, "Passed!" );
    assert.equal( atomStore.xCoord.length, decodedMmtf.numAtoms, "Passed!" );
    assert.equal( atomStore.yCoord.length, decodedMmtf.numAtoms, "Passed!" );
    assert.equal( atomStore.zCoord.length, decodedMmtf.numAtoms, "Passed!" );
    assert.equal( atomStore.bFactor.length, decodedMmtf.numAtoms, "Passed!" );
    assert.equal( atomStore.atomId.length, decodedMmtf.numAtoms, "Passed!" );
    assert.equal( atomStore.altLabel.length, decodedMmtf.numAtoms, "Passed!" );
    assert.equal( atomStore.insCode.length, decodedMmtf.numAtoms, "Passed!" );
    assert.equal( atomStore.occupancy.length, decodedMmtf.numAtoms, "Passed!" );

    var groupStore = decodedMmtf.groupStore;
    assert.equal( groupStore.chainIndex.length, decodedMmtf.numGroups, "Passed!" );
    assert.equal( groupStore.atomOffset.length, decodedMmtf.numGroups, "Passed!" );
    assert.equal( groupStore.atomCount.length, decodedMmtf.numGroups, "Passed!" );
    assert.equal( groupStore.groupTypeId.length, decodedMmtf.numGroups, "Passed!" );
    assert.equal( groupStore.groupId.length, decodedMmtf.numGroups, "Passed!" );
    assert.equal( groupStore.secStruct.length, decodedMmtf.numGroups, "Passed!" );

    var chainStore = decodedMmtf.chainStore;
    assert.equal( chainStore.modelIndex.length, decodedMmtf.numChains, "Passed!" );
    assert.equal( chainStore.groupOffset.length, decodedMmtf.numChains, "Passed!" );
    assert.equal( chainStore.groupCount.length, decodedMmtf.numChains, "Passed!" );
    assert.equal( chainStore.chainName.length, decodedMmtf.numChains * 4, "Passed!" );

    var modelStore = decodedMmtf.modelStore;
    assert.equal( modelStore.chainOffset.length, decodedMmtf.numModels, "Passed!" );
    assert.equal( modelStore.chainCount.length, decodedMmtf.numModels, "Passed!" );
}

// QUnit.test( "decode 1crn", function( assert ) {
//     var done = assert.async();
//     function onload(){
//         var decodedMmtf = decodeMmtf( this.response );

//         assert.equal( decodedMmtf.pdbId, "1CRN", "Passed!" );
//         assert.equal( decodedMmtf.spaceGroup, "P 1 21 1", "Passed!" );
//         assert.close( decodedMmtf.unitCell[ 0 ], 40.959, 0.001, "Passed!" );
//         assert.close( decodedMmtf.unitCell[ 1 ], 18.649, 0.001, "Passed!" );
//         assert.close( decodedMmtf.unitCell[ 2 ], 22.520, 0.001, "Passed!" );
//         assert.close( decodedMmtf.unitCell[ 3 ], 90, 0.001, "Passed!" );
//         assert.close( decodedMmtf.unitCell[ 4 ], 90.769, 0.001, "Passed!" );
//         assert.close( decodedMmtf.unitCell[ 5 ], 90, 0.001, "Passed!" );
//         assert.equal( decodedMmtf.title, "WATER STRUCTURE OF A HYDROPHOBIC PROTEIN AT ATOMIC RESOLUTION. PENTAGON RINGS OF WATER MOLECULES IN CRYSTALS OF CRAMBIN", "Passed!" );

//         assert.equal( decodedMmtf.numBonds, 379, "Passed!" );
//         assert.equal( decodedMmtf.numAtoms, 327, "Passed!" );
//         assert.equal( decodedMmtf.numGroups, 46, "Passed!" );
//         assert.equal( decodedMmtf.numChains, 1, "Passed!" );
//         assert.equal( decodedMmtf.numModels, 1, "Passed!" );

//         assert.equal( Object.keys( decodedMmtf.groupMap ).length, 16, "Passed!" );

//         checkConsistency( decodedMmtf, assert )

//         done();
//     }
//     function onerror(){
//         done();
//     }
//     loadFile( "../data/1crn.mmtf", onload, onerror );
// });
