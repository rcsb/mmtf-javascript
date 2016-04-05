
////////////
// helpers
//
function loadFile( url, onload, onerror ){
    var xhr = new XMLHttpRequest();
    xhr.addEventListener( "load", onload, true );
    xhr.addEventListener( "error", onerror, true );
    xhr.open( "GET", url, true );
    xhr.responseType = "arraybuffer";
    xhr.send();
}

/////////////////////
// functional tests
//
QUnit.module( "functional tests" );

// curl http://mmtf.rcsb.org/full/1crn -o data/1crn.mmtf.gz && gzip -df data/1crn.mmtf.gz

QUnit.test( "decode mmtf 1crn full", function( assert ) {
    var done = assert.async();
    function onload(){
        var decodedMmtf = decodeMmtf( this.response );

        assert.equal( decodedMmtf.structureId, "1CRN", "Wrong PDB ID" );
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

        assert.equal( decodedMmtf.groupList.length, 16, "Passed!" );

        checkMmtf( decodedMmtf, assert );

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

        assert.equal( decodedMsgpack.structureId, "1CRN", "Wrong PDB ID" );
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

        assert.equal( decodedMsgpack.groupList.length, 16, "Wrong number of groupList entries" );

        checkMsgpack( decodedMsgpack, assert );

        done();
    }
    function onerror(){
        done();
    }
    loadFile( "../data/1crn.mmtf", onload, onerror );
});

// curl http://mmtf.rcsb.org/full/1d66 -o data/1d66.mmtf.gz && gzip -df data/1d66.mmtf.gz

QUnit.test( "decode mmtf 1d66 full", function( assert ) {
    var done = assert.async();
    function onload(){
        var decodedMmtf = decodeMmtf( this.response );

        assert.equal( decodedMmtf.structureId, "1D66", "Wrong PDB ID" );

        assert.equal( decodedMmtf.numBonds, 1960,  "Wrong number of bonds" );
        assert.equal( decodedMmtf.numAtoms, 1762,  "Wrong number of atoms" );
        assert.equal( decodedMmtf.numGroups, 207,  "Wrong number of groups" );
        assert.equal( decodedMmtf.numChains, 12,  "Wrong number of chains" );
        assert.equal( decodedMmtf.numModels, 1,  "Wrong number of models" );

        assert.equal( decodedMmtf.groupList.length, 24, "Wrong number of groupList entries" );

        checkMmtf( decodedMmtf, assert );

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

        assert.equal( decodedMsgpack.structureId, "1D66", "Wrong PDB ID" );

        assert.equal( decodedMsgpack.numBonds, 1960, "Wrong number of bonds" );
        assert.equal( decodedMsgpack.numAtoms, 1762, "Wrong number of atoms" );
        assert.equal( decodedMsgpack.groupTypeList.length / 4, 207, "Wrong number of groups" );
        assert.equal( decodedMsgpack.groupsPerChain.length, 12, "Wrong number of chains" );
        assert.equal( decodedMsgpack.chainsPerModel.length, 1, "Wrong number of models" );

        assert.equal( decodedMsgpack.groupList.length, 24, "Wrong number of groupList entries" );

        checkMsgpack( decodedMsgpack, assert );

        done();
    }
    function onerror(){
        done();
    }
    loadFile( "../data/1d66.mmtf", onload, onerror );
});

// curl http://mmtf.rcsb.org/backbone/1d66 -o data/1d66.bb.mmtf.gz && gzip -df data/1d66.bb.mmtf.gz

// QUnit.test( "decode mmtf 1d66 backbone", function( assert ) {
//     var done = assert.async();
//     function onload(){
//         var decodedMmtf = decodeMmtf( this.response );

//         assert.equal( decodedMmtf.structureId, "1D66", "Wrong PDB ID" );

//         assert.equal( decodedMmtf.numBonds, 0,  "Wrong number of bonds" );
//         assert.equal( decodedMmtf.numAtoms, 154,  "Wrong number of atoms" );
//         assert.equal( decodedMmtf.numGroups, 154,  "Wrong number of groups" );
//         assert.equal( decodedMmtf.numChains, 4,  "Wrong number of chains" );
//         assert.equal( decodedMmtf.numModels, 1,  "Wrong number of models" );

//         assert.equal( decodedMmtf.groupList.length, 22, "Wrong number of groupList entries" );

//         checkMmtf( decodedMmtf, assert );

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

//         assert.equal( decodedMsgpack.structureId, "1D66", "Wrong PDB ID" );

//         assert.equal( decodedMsgpack.numBonds, 0, "Wrong number of bonds" );
//         assert.equal( decodedMsgpack.numAtoms, 154, "Wrong number of atoms" );
//         assert.equal( decodedMsgpack.groupTypeList.length / 4, 46, "Wrong number of groups" );
//         assert.equal( decodedMsgpack.groupsPerChain.length, 1, "Wrong number of chains" );
//         assert.equal( decodedMsgpack.chainsPerModel.length, 1, "Wrong number of models" );

//         assert.equal( decodedMsgpack.groupList.length, 24, "Wrong number of groupList entries" );

//         checkMsgpack( decodedMsgpack, assert );

//         done();
//     }
//     function onerror(){
//         done();
//     }
//     loadFile( "../data/1d66.bb.mmtf", onload, onerror );
// });
