
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

// curl http://mmtf.rcsb.org/testdata/4cup.mmtf.gz -o data/4cup.mmtf.gz && gzip -df data/4cup.mmtf.gz

QUnit.test( "decode mmtf 4cup full", function( assert ) {
    var done = assert.async();
    function onload(){
        var decodedMmtf = decodeMmtf( this.response );

        assert.equal( decodedMmtf.structureId, "4CUP", "Wrong PDB ID" );
        assert.equal( decodedMmtf.depositionDate, "2014-03-21", "Wrong deposition date" );
        assert.equal( decodedMmtf.spaceGroup, "C 2 2 21", "Wrong spacegroup" );
        assert.close( decodedMmtf.unitCell[ 0 ], 80.370, 0.001, "Wrong unitcell a length" );
        assert.close( decodedMmtf.unitCell[ 1 ], 96.120, 0.001, "Wrong unitcell b length" );
        assert.close( decodedMmtf.unitCell[ 2 ], 57.669, 0.001, "Wrong unitcell c length" );
        assert.close( decodedMmtf.unitCell[ 3 ], 90.000, 0.001, "Wrong unitcell alpha angle" );
        assert.close( decodedMmtf.unitCell[ 4 ], 90.000, 0.001, "Wrong unitcell beta angle" );
        assert.close( decodedMmtf.unitCell[ 5 ], 90.000, 0.001, "Wrong unitcell gamma angle" );
        assert.equal( decodedMmtf.title, "Crystal structure of human BAZ2B in complex with fragment-1 N09421", "Wrong title" );

        assert.equal( decodedMmtf.numBonds, 978,  "Wrong number of bonds" );
        assert.equal( decodedMmtf.numAtoms, 1107,  "Wrong number of atoms" );
        assert.equal( decodedMmtf.numGroups, 265,  "Wrong number of groups" );
        assert.equal( decodedMmtf.numChains, 6,  "Wrong number of chains" );
        assert.equal( decodedMmtf.numModels, 1,  "Wrong number of models" );

        assert.equal( decodedMmtf.groupList.length, 29, "Passed!" );

        checkMmtf( decodedMmtf, assert );

        done();
    }
    function onerror(){
        done();
    }
    loadFile( "../data/4cup.mmtf", onload, onerror );
});

QUnit.test( "decode msgpack 4cup full", function( assert ) {
    var done = assert.async();
    function onload(){
        var decodedMsgpack = decodeMsgpack( new Uint8Array( this.response ) );
        console.log(decodedMsgpack)
        assert.equal( decodedMsgpack.structureId, "4CUP", "Wrong PDB ID" );
        assert.equal( decodedMsgpack.depositionDate, "2014-03-21", "Wrong deposition date" );
        assert.equal( decodedMsgpack.spaceGroup, "C 2 2 21", "Wrong spacegroup" );
        assert.close( decodedMsgpack.unitCell[ 0 ], 80.370, 0.001, "Wrong unitcell a length" );
        assert.close( decodedMsgpack.unitCell[ 1 ], 96.120, 0.001, "Wrong unitcell b length" );
        assert.close( decodedMsgpack.unitCell[ 2 ], 57.669, 0.001, "Wrong unitcell c length" );
        assert.close( decodedMsgpack.unitCell[ 3 ], 90.000, 0.001, "Wrong unitcell alpha angle" );
        assert.close( decodedMsgpack.unitCell[ 4 ], 90.000, 0.001, "Wrong unitcell beta angle" );
        assert.close( decodedMsgpack.unitCell[ 5 ], 90.000, 0.001, "Wrong unitcell gamma angle" );
        assert.equal( decodedMsgpack.title, "Crystal structure of human BAZ2B in complex with fragment-1 N09421", "Wrong title" );

        assert.equal( decodedMsgpack.numBonds, 978, "Wrong number of bonds" );
        assert.equal( decodedMsgpack.numAtoms, 1107, "Wrong number of atoms" );
        assert.equal( decodedMsgpack.groupTypeList.length / 4, 265, "Wrong number of groups" );
        assert.equal( decodedMsgpack.groupsPerChain.length, 6, "Wrong number of chains" );
        assert.equal( decodedMsgpack.chainsPerModel.length, 1, "Wrong number of models" );

        assert.equal( decodedMsgpack.groupList.length, 29, "Wrong number of groupList entries" );

        checkMsgpack( decodedMsgpack, assert );

        done();
    }
    function onerror(){
        done();
    }
    loadFile( "../data/4cup.mmtf", onload, onerror );
});
