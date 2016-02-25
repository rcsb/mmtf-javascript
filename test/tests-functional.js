
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

        assert.equal( decodedMmtf.numBonds, 379, "Passed!" );
        assert.equal( decodedMmtf.numAtoms, 327, "Passed!" );
        assert.equal( decodedMmtf.numGroups, 46, "Passed!" );
        assert.equal( decodedMmtf.numChains, 1, "Passed!" );
        assert.equal( decodedMmtf.numModels, 1, "Passed!" );
        done();
    }
    function onerror(){
        done();
    }
    loadFile( "../data/1crn.mmtf", onload, onerror );
});
