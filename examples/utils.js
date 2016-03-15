
function $( id ){
    return document.getElementById( id );
}

// from http://stackoverflow.com/a/20463021/1435042
function fileSizeSI(a,b,c,d,e){
    return (b=Math,c=b.log,d=1e3,e=c(a)/c(d)|0,a/b.pow(d,e)).toFixed(2)
        +String.fromCharCode(160)+(e?'kMGTPEZY'[--e]+'B':'Bytes')
}

function formatMilliseconds( ms ){
	var l = [];
	var seconds = Math.floor( ms / 1000 );
	var minutes = Math.floor( seconds / 60 );
	if( minutes >= 1 ){
		l.push( minutes + "m" );
		ms -= seconds * 1000;
		seconds -= minutes * 60;
	}
	if( seconds >= 1 ){
		l.push( seconds + "s" );
		if( minutes < 1 ) ms -= seconds * 1000;
	}
	if( ms !== 0 ){
		l.push( ms.toFixed( 2 ) + "ms" );
	}
	return l.join( " " );
}

function getMmtfUrl( pdbid, backboneOnly ){
    pdbid = pdbid.toUpperCase();
    var baseUrl;
    if( backboneOnly ){
        baseUrl = "http://mmtf.rcsb.org/backbone/";
    }else{
        baseUrl = "http://mmtf.rcsb.org/full/";
    }
    return baseUrl + pdbid;
}

function GET( id ){
    var a = new RegExp( id + "=([^&#=]*)" );
    var m = a.exec( window.location.search );
    if( m ){
        return decodeURIComponent( m[1] );
    }else{
        return undefined;
    }
};

function decodeSupervised( bin, log ){
    var t0 = performance.now();
    var raw = decodeMsgpack( new Uint8Array( bin ) );
    if( log ) console.log( raw );
    var t1 = performance.now();
    var structure = decodeMmtf( raw );
    var t2 = performance.now();
    var coordByteLength = (
        raw.xCoordBig.byteLength + raw.xCoordSmall.byteLength +
        raw.yCoordBig.byteLength + raw.yCoordSmall.byteLength +
        raw.zCoordBig.byteLength + raw.zCoordSmall.byteLength
    );
    var bfactorByteLength = 0;
    if( raw.bFactorBig && raw.bFactorSmall ){
        bfactorByteLength = (
            raw.bFactorBig.byteLength + raw.bFactorSmall.byteLength
        );
    }
    var info = {
        msgpackByteLength: bin.byteLength,
        coordByteLength: coordByteLength,
        bfactorByteLength: bfactorByteLength,
        decodeTimeMs: t2 - t0,
        decodeMsgpackTimeMs: t1 - t0,
        decodeMmtfTimeMs: t2 - t1
    };
    return {
        structure: structure,
        info: info
    };
}

function getStoreByteLength( store ){
    var bytes = 0;
    for( var name in store ){
        var field = store[ name ];
        if( field ) bytes += field.buffer.byteLength;
    }
    return bytes;
}

function getStats( structure, info ){

    var s = structure;
    var unpackedStoreBytes = (
        getStoreByteLength( s.bondStore ) +
        getStoreByteLength( s.atomStore ) +
        getStoreByteLength( s.groupStore ) +
        getStoreByteLength( s.chainStore ) +
        getStoreByteLength( s.modelStore )
    );
    if( s.numAtoms === 0 ) console.log(s.pdbId)
    return {
        pdbId: s.pdbId,

        msgpackByteLength: info.msgpackByteLength,
        coordByteLength: info.coordByteLength,
        bfactorByteLength: info.bfactorByteLength,

        decodeTimeMs: info.decodeTimeMs,
        decodeMsgpackTimeMs: info.decodeMsgpackTimeMs,
        decodeMmtfTimeMs: info.decodeMmtfTimeMs,

        msgpackBytesPerAtom: s.numAtoms ? info.msgpackByteLength / s.numAtoms : 0,

        numBonds: s.numBonds,
        numAtoms: s.numAtoms,
        numGroups: s.numGroups,
        numChains: s.numChains,
        numModels: s.numModels,
    };
}

function getAtomInfo( structure, index ){
    var s = structure;
    var atom = s.getAtom( index );
    var group = s.getGroup( atom[ 0 ] );
    var chain = s.getChain( group[ 0 ] );
    var model = s.getModel( chain[ 0 ] );
    return {
        index: index,
        xCoord: atom[ 1 ],
        yCoord: atom[ 2 ],
        zCoord: atom[ 3 ],
        bFactor: atom[ 4 ],
        element: atom[ 5 ],
        atomId: atom[ 6 ],
        chemCompType: atom[ 7 ],
        altLabel: atom[ 8 ],
        atomName: atom[ 9 ],
        insCode: atom[ 10 ],
        occupancy: atom[ 11 ],
        //
        groupId: group[ 3 ],
        groupName: group[ 4 ],
        singleLetterCode: atom[ 12 ],
        secStruct: group[ 5 ],
        //
        model: chain[ 0 ],
        chainName: chain[ 3 ],
    };
}

function printObject( obj, id ){
    var elm = document.getElementById( id );
    var html = "";
    for( var name in obj ){
        html += name + ": " + obj[ name ] + "<br/>";
    }
    elm.innerHTML = html;
}

function showRandomAtomInfo( sh, id ){
    var atomInfo = getAtomInfo( sh, Math.floor( Math.random() * sh.numAtoms ) );
    atomInfo.xCoord = atomInfo.xCoord.toFixed( 3 );
    atomInfo.yCoord = atomInfo.yCoord.toFixed( 3 );
    atomInfo.zCoord = atomInfo.zCoord.toFixed( 3 );
    if( atomInfo.bFactor !== null ) atomInfo.bFactor = atomInfo.bFactor.toFixed( 2 );
    if( atomInfo.occupancy !== null ) atomInfo.occupancy = atomInfo.occupancy.toFixed( 2 );
    printObject( atomInfo, id );
}

function showStats( stats, id ){
    stats.msgpackSize = fileSizeSI( stats.msgpackByteLength );
    if( "msgpackBytesPerAtom" in stats ){
        stats.msgpackSizePerAtom = fileSizeSI( stats.msgpackBytesPerAtom );
        delete stats.msgpackBytesPerAtom;
    }
    stats.coordsSize = fileSizeSI( stats.coordByteLength );
    stats.bfactorSize = fileSizeSI( stats.bfactorByteLength );
    stats.overallTime = formatMilliseconds( stats.overallTimeMs );
    stats.decodeTime = formatMilliseconds( stats.decodeTimeMs );
    stats.decodeMsgpackTime = formatMilliseconds( stats.decodeMsgpackTimeMs );
    stats.decodeMmtfTime = formatMilliseconds( stats.decodeMmtfTimeMs );
    delete stats.msgpackByteLength;
    delete stats.coordByteLength;
    delete stats.bfactorByteLength;
    delete stats.overallTimeMs;
    delete stats.decodeTimeMs;
    delete stats.decodeMsgpackTimeMs;
    delete stats.decodeMmtfTimeMs;
    printObject( stats, id );
}

function objectListToCsv( objList ){
    var nameList = Object.keys( objList[ 0 ] );
    var strList = [ nameList.join( "," ) ];
    for( var i = 0, il = objList.length; i < il; ++i ){
        var obj = objList[ i ];
        var rowList = [];
        for( var j = 0, jl = nameList.length; j < jl; ++j ){
            rowList.push( obj[ nameList[ j ] ] );
        }
        strList.push( rowList.join( "," ) );
    }
    return strList.join( "\n" );
}

function download( data, downloadName ){
    downloadName = downloadName || "download";
    var a = document.createElement( 'a' );
    a.style.display = "hidden";
    document.body.appendChild( a );
    if( data instanceof Blob ){
        a.href = URL.createObjectURL( data );
    }else{
        // assume text
        a.href = URL.createObjectURL(
            new Blob( [ data ], { type: 'text/plain' } )
        );
    }
    a.download = downloadName;
    a.target = "_blank";
    a.click();
    document.body.removeChild( a );
    if( data instanceof Blob ){
        URL.revokeObjectURL( data );
    }
};

function downloadStats( stats, asCsv ){
    var filename = "mmtf-stats";
    var data;
    if( asCsv ){
        data = objectListToCsv( stats );
        filename += ".csv";
    }else{
        data = JSON.stringify( stats, null, '\t' );
        filename += ".json";
    }
    download( data, filename );
}

function downloadErrors( errors ){
    var filename = "mmtf-errors.json";
    var data = JSON.stringify( errors, null, '\t' );
    download( data, filename );
}

function downloadSummary( status, avg, sum ){
    var filename = "mmtf-summary.json";
    var summary = {
        status: status,
        avg: avg,
        sum: sum
    };
    var data = JSON.stringify( summary, null, '\t' );
    download( data, filename );
}
