
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

// curl http://mmtf.rcsb.org/v0.2/full/3zyb.mmtf.gz -o data/3zyb.mmtf.gz && gzip -df data/3zyb.mmtf.gz;
// curl http://mmtf.rcsb.org/v0.2/full/4cup.mmtf.gz -o data/4cup.mmtf.gz && gzip -df data/4cup.mmtf.gz;
// curl http://mmtf.rcsb.org/v0.2/full/1o2f.mmtf.gz -o data/1o2f.mmtf.gz && gzip -df data/1o2f.mmtf.gz;
// curl http://mmtf.rcsb.org/v0.2/full/1bna.mmtf.gz -o data/1bna.mmtf.gz && gzip -df data/1bna.mmtf.gz;
// curl http://mmtf.rcsb.org/v0.2/full/4y60.mmtf.gz -o data/4y60.mmtf.gz && gzip -df data/4y60.mmtf.gz;
// curl http://mmtf.rcsb.org/v0.2/full/1skm.mmtf.gz -o data/1skm.mmtf.gz && gzip -df data/1skm.mmtf.gz;
// curl http://mmtf.rcsb.org/v0.2/full/1lpv.mmtf.gz -o data/1lpv.mmtf.gz && gzip -df data/1lpv.mmtf.gz;
// curl http://mmtf.rcsb.org/v0.2/full/1msh.mmtf.gz -o data/1msh.mmtf.gz && gzip -df data/1msh.mmtf.gz;
// curl http://mmtf.rcsb.org/v0.2/full/1r9v.mmtf.gz -o data/1r9v.mmtf.gz && gzip -df data/1r9v.mmtf.gz;
// curl http://mmtf.rcsb.org/v0.2/full/5emg.mmtf.gz -o data/5emg.mmtf.gz && gzip -df data/5emg.mmtf.gz;
// curl http://mmtf.rcsb.org/v0.2/full/4ck4.mmtf.gz -o data/4ck4.mmtf.gz && gzip -df data/4ck4.mmtf.gz;
// curl http://mmtf.rcsb.org/v0.2/full/4v5a.mmtf.gz -o data/4v5a.mmtf.gz && gzip -df data/4v5a.mmtf.gz;
// curl http://mmtf.rcsb.org/v0.2/full/5esw.mmtf.gz -o data/5esw.mmtf.gz && gzip -df data/5esw.mmtf.gz;

var testEntries = [
    "3zyb", "4cup", "1o2f", "1bna", "4y60", "1skm", "1lpv", "1msh", "1r9v",
    "5emg", "4ck4", "4v5a", "5esw"
];

testEntries.forEach( function( name ){

    QUnit.test( "decode " + name, function( assert ) {
        var done = assert.async();
        function onload(){
            var decodedMsgpack = decodeMsgpack( new Uint8Array( this.response ) );
            assert.equal( decodedMsgpack.structureId, name.toUpperCase(), "Wrong PDB ID" );
            checkMsgpack( decodedMsgpack, assert );
            var decodedMmtf = decodeMmtf( decodedMsgpack );
            assert.equal( decodedMmtf.structureId, name.toUpperCase(), "Wrong PDB ID" );
            checkMmtf( decodedMmtf, assert );
            done();
        }
        function onerror(){
            done();
        }
        loadFile( "../data/" + name + ".mmtf", onload, onerror );
    } );

} );
