

importScripts(
    "../lib/bops.js",
    "../lib/msgpack.js",
    "../src/decoder.js",
    "utils.js"
);


function makeXhrPromise( method, url, responseType ){
    return new Promise( function( resolve, reject ){
        var xhr = new XMLHttpRequest();
        xhr.responseType = responseType;
        xhr.open( method, url );
        xhr.onload = function(){
            if( this.status === 200 || this.status === 304 || this.status === 0 ){
                resolve( xhr.response );
            }else{
                reject( {
                    status: this.status,
                    statusText: xhr.statusText
                } );
            }
        };
        xhr.onerror = function(){
            reject( {
                status: this.status,
                statusText: xhr.statusText
            } );
        };
        xhr.send();
    });
}


function loadStructure( pdbid ){
    pdbid = pdbid.toUpperCase();
    var promise = makeXhrPromise(
        "GET",
        "http://132.249.213.67:8080/servemessagepack/" + pdbid,
        "arraybuffer"
    );
    return promise.then( function( result ){
        var sd = new StructureDecoder( result );
        sd.decode();
        return sd;
    } );
}


onmessage = function( e ){

    var pdbIdList = e.data;
    var promiseList = [];

    for( var i = 0, il = pdbIdList.length; i < il; ++i ){
        promiseList.push( loadStructure( pdbIdList[ i ] ) );
    }

    Promise.all( promiseList ).then( function( resultList ){
        var statsList = [];
        resultList.forEach( function( sd ){
            statsList.push( getStats( sd ) );
        } );
        postMessage( statsList );
    } );

};
