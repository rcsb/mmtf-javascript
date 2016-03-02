
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
        hetFlag: atom[ 7 ],
        altLabel: atom[ 8 ],
        atomName: atom[ 9 ],
        insCode: atom[ 10 ],
        occupancy: atom[ 11 ],
        //
        groupNum: group[ 3 ],
        groupName: group[ 4 ],
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
    atomInfo.bFactor = atomInfo.bFactor.toFixed( 2 );
    if( atomInfo.occupancy !== undefined ) atomInfo.occupancy = atomInfo.occupancy.toFixed( 2 );
    printObject( atomInfo, id );
}

function showStats( stats, id ){
    stats.msgpackSize = fileSizeSI( stats.msgpackByteLength );
    stats.coordsSize = fileSizeSI( stats.coordByteLength );
    stats.bfactorSize = fileSizeSI( stats.bfactorByteLength );
    stats.decodeTime = formatMilliseconds( stats.decodeTimeMs );
    stats.decodeMsgpackTime = formatMilliseconds( stats.decodeMsgpackTimeMs );
    stats.decodeMmtfTime = formatMilliseconds( stats.decodeMmtfTimeMs );
    delete stats.msgpackByteLength;
    delete stats.coordByteLength;
    delete stats.bfactorByteLength;
    delete stats.decodeTimeMs;
    delete stats.decodeMsgpackTimeMs;
    delete stats.decodeMmtfTimeMs;
    if( "msgpackBytesPerAtom" in stats ){
        stats.msgpackBytesPerAtom = stats.msgpackBytesPerAtom.toFixed( 2 );
    }
    printObject( stats, id );
}
