

importScripts(
    "../dist/mmtf-decode.js",
    "utils.js"
);


function makeXhrPromise( method, url, responseType ){
    return new Promise( function( resolve, reject ){
        var xhr = new XMLHttpRequest();
        xhr.open( method, url );
        xhr.responseType = responseType;
        xhr.onload = function(){
            if( this.status === 200 || this.status === 304 || this.status === 0 ){
                if( this.response.byteLength === 0 ){
                    reject( "zero byteLength" );
                }else{
                    resolve( this.response );
                }
            }else{
                reject( {
                    status: this.status,
                    statusText: this.statusText
                } );
            }
        };
        xhr.onerror = function(){
            console.log( "error", this.status, url );
            reject( {
                status: this.status,
                statusText: this.statusText
            } );
        };
        xhr.send();
    } );
}


var status = {
    requested: 0,
    finished: 0,
    failed: 0
};

function loadStructure( pdbid, cAlphaOnly ){
    var promise = makeXhrPromise(
        "GET", getMmtfUrl( pdbid, cAlphaOnly ), "arraybuffer"
    );
    return promise.then( function( result ){
        try{
            var t0 = performance.now();
            var ds = decodeMmtf( result );
            var t1 = performance.now();
            var info = {
                msgpackByteLength: result.byteLength,
                decodeTimeMs: t1 - t0
            };
            status.finished += 1;
            return getStats( new StructureHelper( ds ), info );
        }catch( e ){
            status.failed += 1;
            console.error( e, pdbid, cAlphaOnly );
            return false;
        }
    } ).catch( function( e ){
        status.failed += 1;
        console.error( e, pdbid, cAlphaOnly );
        return false;
    } );
}


function loadBunch( pdbIdList, cAlphaOnly ){
    var promiseList = [];
    for( var i = 0, il = pdbIdList.length; i < il; ++i ){
        promiseList.push( loadStructure( pdbIdList[ i ], cAlphaOnly ) );
    }
    return Promise.all( promiseList );
}


onmessage = function( e ){

    var pdbIdList = e.data.pdbIdList;
    var cAlphaOnly = e.data.cAlphaOnly;
    var chunkList = [];
    var statsList = [];

    status.requested = pdbIdList.length;
    status.finished = 0;
    status.failed = 0;

    var chunkSize = 100;
    for( var i = 0, il = pdbIdList.length; i < il; i += chunkSize ){
        chunkList.push( i );
    }

    var queue = new Queue( function( start, callback ){
        var pdbIdChunk = pdbIdList.slice( start, start + chunkSize );
        loadBunch( pdbIdChunk, cAlphaOnly ).then( function( sdList ){
            sdList.forEach( function( stats ){
                if( stats ){
                    statsList.push( stats );
                }
            } );
            if( queue.length() % 5 === 0 ){
                postMessage( {
                    statsList: statsList,
                    status: status
                } );
            }
            callback();
        } );
    }, chunkList );

};


function Queue( fn, argList ){

    var queue = [];
    var pending = false;

    if( argList ){
        for( var i = 0, il = argList.length; i < il; ++i ){
            queue.push( argList[ i ] );
        }
        next();
    }

    function run( arg ){
        fn( arg, next );
    }

    function next(){
        var arg = queue.shift();
        if( arg !== undefined ){
            pending = true;
            setTimeout( function(){ run( arg ); } );
        }else{
            pending = false;
        }
    }

    // API

    this.push = function( arg ){
        queue.push( arg );
        if( !pending ) next();
    }

    this.kill = function( arg ){
        queue.length = 0;
    };

    this.length = function(){
        return queue.length;
    };

}

