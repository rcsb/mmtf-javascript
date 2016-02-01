

importScripts(
    "../dist/structure-decoder.js",
    "utils.js"
);


function makeXhrPromise( method, url, responseType ){
    return new Promise( function( resolve, reject ){
        var xhr = new XMLHttpRequest();
        xhr.open( method, url );
        xhr.responseType = responseType;
        xhr.onload = function(){
            if( this.status === 200 || this.status === 304 || this.status === 0 ){
                resolve( this.response );
            }else{
                reject( {
                    status: this.status,
                    statusText: this.statusText
                } );
            }
        };
        xhr.onerror = function(){
            console.log( "error", this.status )
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


function loadStructure( pdbid ){
    pdbid = pdbid.toUpperCase();
    var promise = makeXhrPromise(
        "GET",
        "http://132.249.213.68:8080/servemessagepack/" + pdbid,
        "arraybuffer"
    );
    return promise.then( function( result ){
        try{
            var sd = new StructureDecoder( result );
            sd.decode();
            status.finished += 1;
            return sd;
        }catch( e ){
            status.failed += 1;
            console.error( e );
            return false;
        }
    } ).catch( function( e ){
        status.failed += 1;
        console.error( e );
        return false;
    } );
}


function loadBunch( pdbIdList ){
    var promiseList = [];
    for( var i = 0, il = pdbIdList.length; i < il; ++i ){
        promiseList.push( loadStructure( pdbIdList[ i ] ) );
    }
    return Promise.all( promiseList );
}


onmessage = function( e ){

    var pdbIdList = e.data;
    var chunkList = [];
    var statsList = [];

    status.requested = pdbIdList.length;
    status.finished = 0;

    var chunkSize = 100;
    for( var i = 0, il = pdbIdList.length; i < il; i += chunkSize ){
        chunkList.push( i );
    }

    var queue = new Queue( function( start, callback ){
        var pdbIdChunk = pdbIdList.slice( start, start + chunkSize );
        loadBunch( pdbIdChunk ).then( function( sdList ){
            sdList.forEach( function( sd ){
                if( sd ){
                    statsList.push( getStats( sd ) );
                }
            } );
            if( queue.length() % 5 === 0 ){
                postMessage( statsList );
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

