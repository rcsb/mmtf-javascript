
module = {};

importScripts(
    "../test/polyfills.js",
    "promise.min.js",
    "utils.js",
    "structure.js",
    "../build/mmtf-decode.test.js"
);

var status = {
    requested: 0,
    finished: 0,
    failed: 0,
    timeMs: 0,
    backboneOnly: undefined
};

var errors = {};


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
            setTimeout( function(){ run( arg ); }, 0 );
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


function makeXhrPromise( method, url, responseType ){
    return new Promise( function( resolve, reject ){
        var t0 = performance.now();
        var xhr = new XMLHttpRequest();
        xhr.open( method, url );
        xhr.responseType = responseType;
        xhr.addEventListener( "load", function(){
            var t1 = performance.now();
            if( this.status === 200 || this.status === 304 || this.status === 0 ){
                if( this.response.byteLength === 0 ){
                    reject( {
                        msg: "zero byteLength"
                    } );
                }else{
                    resolve( {
                        response: this.response
                    } );
                }
            }else{
                reject( {
                    msg: this.status + " " + this.statusText
                } );
            }
        }, true );
        xhr.addEventListener( "error", function(){
            reject( {
                msg: this.status + " " + this.statusText
            } );
        }, true );
        xhr.send();
    } );
}


function loadStructure( pdbid, backboneOnly ){
    var promise = makeXhrPromise(
        "GET", getMmtfUrl( pdbid, backboneOnly ), "arraybuffer"
    );
    return promise.then( function( result ){
        try{
            var d = decodeSupervised( result.response );
            status.finished += 1;
            return getStats( new SimpleStructure( d.structure ), d.info );
        }catch( e ){
            status.failed += 1;
            errors[ pdbid ] = "decoding error";
            return false;
        }
    } ).catch( function( error ){
        status.failed += 1;
        errors[ pdbid ] = error.msg;
        return false;
    } );
}


function loadBunch( pdbIdList, backboneOnly ){
    var promiseList = [];
    for( var i = 0, il = pdbIdList.length; i < il; ++i ){
        promiseList.push( loadStructure( pdbIdList[ i ], backboneOnly ) );
    }
    return Promise.all( promiseList );
}


onmessage = function( e ){
    var pdbIdList = e.data.pdbIdList;
    var backboneOnly = e.data.backboneOnly;
    var chunkList = [];
    var statsList = [];

    status.requested = pdbIdList.length;
    status.finished = 0;
    status.failed = 0;
    status.timeMs = 0;
    status.backboneOnly = backboneOnly;

    var chunkSize = 100;
    for( var i = 0, il = pdbIdList.length; i < il; i += chunkSize ){
        chunkList.push( i );
    }

    var queue = new Queue( function( start, callback ){
        var pdbIdChunk = pdbIdList.slice( start, start + chunkSize );
        var t0 = performance.now();
        loadBunch( pdbIdChunk, backboneOnly ).then( function( sdList ){
            var t1 = performance.now();
            status.timeMs += t1 - t0;
            sdList.forEach( function( stats ){
                if( stats !== false ){
                    statsList.push( stats );
                }
            } );
            if( queue.length() % 5 === 0 ){
                postMessage( {
                    statsList: statsList,
                    status: status,
                    errors: errors
                } );
            }
            callback();
        } );
    }, chunkList );

};
