

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
		ms -= seconds * 1000;
	}
	if( ms !== 0 ){
		l.push( ms.toFixed( 2 ) + "ms" );
	}
	return l.join( " " );
}

function getStoreByteLength( store ){
    var bytes = 0;
    for( var name in store ){
        bytes += store[ name ].buffer.byteLength;
    }
    return bytes;
}

function getStats( structureDecoder ){
    var sd = structureDecoder;
    var unpackedBytes = (
        getStoreByteLength( sd.bondStore ) +
        getStoreByteLength( sd.atomStore ) +
        getStoreByteLength( sd.residueStore ) +
        getStoreByteLength( sd.chainStore ) +
        getStoreByteLength( sd.modelStore )
    );
    return {
        pdbId: "???",
        msgpackByteLength: sd.buffer.byteLength,
        unpackedByteLength: unpackedBytes,
        msgpackSize: fileSizeSI( sd.buffer.byteLength ),
        unpackedSize: fileSizeSI( unpackedBytes ),
        compressionRatio: unpackedBytes / sd.buffer.byteLength,
        bondCount: sd.bondCount,
        atomCount: sd.atomCount,
        residueCount: sd.residueCount,
        chainCount: sd.chainCount,
        modelCount: sd.modelCount,
        msgpackDecodeTimeMs: sd.__msgpackDecodeTimeMs,
        structureDecodeTimeMs: sd.__structureDecodeTimeMs,
    };
}

function getAtomInfo( structureDecoder, index ){
    var sd = structureDecoder;
    var atom = sd.getAtom( index );
    var residue = sd.getResidue( atom[ 0 ] );
    var chain = sd.getChain( residue[ 0 ] );
    var model = sd.getModel( chain[ 0 ] );
    return {
        index: index,
        x: atom[ 1 ],
        y: atom[ 2 ],
        z: atom[ 3 ],
        bfactor: atom[ 4 ],
        element: atom[ 5 ],
        serial: atom[ 6 ],
        hetero: atom[ 7 ],
        altloc: atom[ 8 ],
        atomname: atom[ 9 ],
        //
        resno: residue[ 3 ],
        resname: residue[ 4 ],
        sstruc: residue[ 5 ],
        //
        modelIndex: chain[ 0 ],
        chainname: chain[ 3 ],
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

function showRandomAtomInfo( sd, id ){
    var atomInfo = getAtomInfo( sd, Math.floor( Math.random() * sd.atomCount ) );
    printObject( atomInfo, id );
}

function readableStats( stats ){
    stats = Object.assign( {}, stats );
    if( stats.compressionRatio ) stats.compressionRatio = stats.compressionRatio.toFixed( 2 );
    stats.msgpackSize = fileSizeSI( stats.msgpackByteLength );
    stats.unpackedSize = fileSizeSI( stats.unpackedByteLength );
    stats.msgpackDecodeTime = formatMilliseconds( stats.msgpackDecodeTimeMs );
    stats.structureDecodeTime = formatMilliseconds( stats.structureDecodeTimeMs );
    delete stats.msgpackByteLength;
    delete stats.unpackedByteLength;
    delete stats.msgpackDecodeTimeMs;
    delete stats.structureDecodeTimeMs;
    return stats;
}

function showStats( sd, id ){
    var stats = getStats( sd );
    printObject( readableStats( stats ), id );
}
