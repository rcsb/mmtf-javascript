

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

function getMmtfUrl( pdbid, cAlphaOnly ){
    pdbid = pdbid.toUpperCase();
    var baseUrl;
    if( cAlphaOnly ){
        baseUrl = "http://132.249.213.68:8080/servemessagecalpha/";
    }else{
        baseUrl = "http://132.249.213.68:8080/servemessagepack/";
    }
    return baseUrl + pdbid;
}

function getStoreByteLength( store ){
    var bytes = 0;
    for( var name in store ){
        var field = store[ name ];
        if( field ) bytes += field.buffer.byteLength;
    }
    return bytes;
}

function getStats( structureHelper, info ){

    var sh = structureHelper;
    var unpackedBytes = (
        getStoreByteLength( sh.bondStore ) +
        getStoreByteLength( sh.atomStore ) +
        getStoreByteLength( sh.groupStore ) +
        getStoreByteLength( sh.chainStore ) +
        getStoreByteLength( sh.modelStore )
    );
    return {
        pdbId: sh.pdbId,

        msgpackByteLength: info.msgpackByteLength,
        decodeTimeMs: info.decodeTimeMs,

        numBonds: sh.numBonds,
        numAtoms: sh.numAtoms,
        numGroups: sh.numGroups,
        numChains: sh.numChains,
        numModels: sh.numModels,
    };
}

function getAtomInfo( structureHelper, index ){
    var sh = structureHelper;
    var atom = sh.getAtom( index );
    var group = sh.getGroup( atom[ 0 ] );
    var chain = sh.getChain( group[ 0 ] );
    var model = sh.getModel( chain[ 0 ] );
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
    printObject( atomInfo, id );
}

function showStats( stats, id ){
    stats.fileSize = fileSizeSI( stats.msgpackByteLength ),
    stats.decodeTime = formatMilliseconds( stats.decodeTimeMs ),
    delete stats.msgpackByteLength;
    delete stats.decodeTimeMs;
    printObject( stats, id );
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
            d.atomStore.xCoord[ index ],
            d.atomStore.yCoord[ index ],
            d.atomStore.zCoord[ index ],
            d.atomStore.bFactor ? d.atomStore.bFactor[ index ] : null,
            group.atomInfo[ groupAtomIndex * 2 ],
            d.atomStore.atomId ? d.atomStore.atomId[ index ] : null,
            group.hetFlag,
            d.atomStore.altLabel ? String.fromCharCode( d.atomStore.altLabel[ index ] ) : null,
            group.atomInfo[ groupAtomIndex * 2 + 1 ],
            d.atomStore.insCode ? String.fromCharCode( d.atomStore.insCode[ index ] ) : null,
            d.atomStore.occupancy ? d.atomStore.occupancy[ index ] : null
        ];
    }

    function getGroup( index ){
        var group = d.groupMap[ d.groupStore.groupTypeId[ index ] ];
        var sstrucCode = d.groupStore.secStruct[ index ];
        return [
            d.groupStore.chainIndex[ index ],
            d.groupStore.atomOffset[ index ],
            d.groupStore.atomCount[ index ],
            d.groupStore.groupNum[ index ],
            group.resName,
            sstrucMap[ sstrucCode ]
        ];
    }

    function getChain( index ){
        var chainName = "";
        for( var k = 0; k < 4; ++k ){
            var code = d.chainStore.chainName[ 4 * index + k ];
            if( code ){
                chainName += String.fromCharCode( code );
            }else{
                break;
            }
        }
        return [
            d.chainStore.modelIndex[ index ],
            d.chainStore.groupOffset[ index ],
            d.chainStore.groupCount[ index ],
            chainName
        ];
    }

    function getModel( index ){
        return [
            d.modelStore.chainOffset[ index ],
            d.modelStore.chainCount[ index ]
        ];
    }

    function eachBond( callback ){
        for( var i = 0; i < d.numBonds; ++i ){
            callback.apply( null, getBond( i ) );
        }
    }

    function eachAtom( callback ){
        for( var i = 0; i < d.numAtoms; ++i ){
            callback.apply( null, getAtom( i ) );
        }
    }

    function eachGroup( callback ){
        for( var i = 0; i < d.numGroups; ++i ){
            callback.apply( null, getGroup( i ) );
        }
    }

    function eachChain( callback ){
        for( var i = 0; i < d.numChains; ++i ){
            callback.apply( null, getChain( i ) );
        }
    }

    function eachModel( callback ){
        for( var i = 0; i < d.numModels; ++i ){
            callback.apply( null, getModel( i ) );
        }
    }

    var sstrucMap = {
        "0": "i",  // pi helix
        "1": "s",  // bend
        "2": "h",  // alpha helix
        "3": "e",  // extended
        "4": "g",  // 3-10 helix
        "5": "b",  // bridge
        "6": "t",  // turn
        "7": "l",  // coil
        "-1": ""   // NA
    };

    // API

    this.unitCell = d.unitCell;
    this.spaceGroup = d.spaceGroup;
    this.bioAssembly = d.bioAssembly;
    this.pdbId = d.pdbId;
    this.title = d.title;

    this.numBonds = d.numBonds;
    this.numAtoms = d.numAtoms;
    this.numGroups = d.numGroups;
    this.numChains = d.numChains;
    this.numModels = d.numModels;

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
