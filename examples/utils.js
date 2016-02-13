

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

function getStoreByteLength( store ){
    var bytes = 0;
    for( var name in store ){
        bytes += store[ name ].buffer.byteLength;
    }
    return bytes;
}

function getStats( structureHelper ){
    var sh = structureHelper;
    var unpackedBytes = (
        getStoreByteLength( sh.bondStore ) +
        getStoreByteLength( sh.atomStore ) +
        getStoreByteLength( sh.groupStore ) +
        getStoreByteLength( sh.chainStore ) +
        getStoreByteLength( sh.modelStore )
    );
    return {
        pdbId: "???",
        // msgpackByteLength: sh.buffer.byteLength,
        msgpackByteLength: 0,
        unpackedByteLength: unpackedBytes,
        // msgpackSize: fileSizeSI( sh.buffer.byteLength ),
        msgpackSize: 0,
        unpackedSize: fileSizeSI( unpackedBytes ),
        // compressionRatio: unpackedBytes / sh.buffer.byteLength,
        compressionRatio: 0,
        bondCount: sh.bondCount,
        atomCount: sh.atomCount,
        groupCount: sh.groupCount,
        chainCount: sh.chainCount,
        modelCount: sh.modelCount,
        msgpackDecodeTimeMs: 0,
        structureDecodeTimeMs: 0,
    };
}

function getAtomInfo( structureDecoder, index ){
    var sd = structureDecoder;
    var atom = sd.getAtom( index );
    var group = sd.getGroup( atom[ 0 ] );
    var chain = sd.getChain( group[ 0 ] );
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
        resno: group[ 3 ],
        resname: group[ 4 ],
        sstruc: group[ 5 ],
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

//

function StructureHelper( d ){

    function getBond( index ){
        return [
            d.bondStore.atomIndex1[ index ],
            d.bondStore.atomIndex2[ index ],
            d.bondStore.bondOrder[ index ]
        ];
    }

    function getAtom( index ){
        var groupIndex = d.atomStore.groupIndex[ index ];
        var group = d.groupMap[ d.groupStore.groupTypeId[ groupIndex ] ];
        var groupAtomOffset = d.groupStore.atomOffset[ groupIndex ];
        var groupAtomIndex = index - groupAtomOffset;
        return [
            groupIndex,
            d.atomStore.x[ index ],
            d.atomStore.y[ index ],
            d.atomStore.z[ index ],
            d.atomStore.bfactor[ index ],
            group.atomInfo[ groupAtomIndex * 2 ],
            d.atomStore.serial[ index ],
            group.hetFlag,
            String.fromCharCode( d.atomStore.altloc[ index ] ),
            group.atomInfo[ groupAtomIndex * 2 + 1 ]
        ];
    }

    function getGroup( index ){
        var group = d.groupMap[ d.groupStore.groupTypeId[ index ] ];
        return [
            d.groupStore.chainIndex[ index ],
            d.groupStore.atomOffset[ index ],
            d.groupStore.atomCount[ index ],
            d.groupStore.resno[ index ],
            group.resName,
            String.fromCharCode( d.groupStore.sstruc[ index ] ),
        ];
    }

    function getChain( index ){
        var chainname = "";
        for( var k = 0; k < 4; ++k ){
            var code = d.chainStore.chainname[ 4 * index + k ];
            if( code ){
                chainname += String.fromCharCode( code );
            }else{
                break;
            }
        }
        return [
            d.chainStore.modelIndex[ index ],
            d.chainStore.groupOffset[ index ],
            d.chainStore.groupCount[ index ],
            chainname,
        ];
    }

    function getModel( index ){
        return [
            d.modelStore.chainOffset[ index ],
            d.modelStore.chainCount[ index ]
        ];
    }

    function eachBond( callback ){
        for( var i = 0; i < d.bondCount; ++i ){
            callback.apply( null, getBond( i ) );
        }
    }

    function eachAtom( callback ){
        for( var i = 0; i < d.atomCount; ++i ){
            callback.apply( null, getAtom( i ) );
        }
    }

    function eachGroup( callback ){
        for( var i = 0; i < d.groupCount; ++i ){
            callback.apply( null, getGroup( i ) );
        }
    }

    function eachChain( callback ){
        for( var i = 0; i < d.chainCount; ++i ){
            callback.apply( null, getChain( i ) );
        }
    }

    function eachModel( callback ){
        for( var i = 0; i < d.modelCount; ++i ){
            callback.apply( null, getModel( i ) );
        }
    }

    // API

    this.unitCell = d.unitCell;
    this.spaceGroup = d.spaceGroup;

    this.bondCount = d.bondCount;
    this.atomCount = d.atomCount;
    this.groupCount = d.groupCount;
    this.chainCount = d.chainCount;
    this.modelCount = d.modelCount;

    this.bondStore = d.bondStore;
    this.atomStore = d.atomStore;
    this.groupStore = d.groupStore;
    this.chainStore = d.chainStore;
    this.modelStore = d.modelStore;
    this.groupMap = d.groupMap;

    this.getBond = getBond;
    this.getAtom = getAtom;
    this.getGroup = getGroup;
    this.getChain = getChain;
    this.getModel = getModel;

    this.eachBond = eachBond;
    this.eachAtom = eachAtom;
    this.eachGroup = eachGroup;
    this.eachChain = eachChain;
    this.eachModel = eachModel;

}
