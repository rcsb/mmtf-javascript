

function getDownloadTimes( stats ){}

function getStats( structureDecoder ){

    var sd = structureDecoder;

    // from http://stackoverflow.com/a/20463021/1435042
    function fileSizeSI(a,b,c,d,e){
        return (b=Math,c=b.log,d=1e3,e=c(a)/c(d)|0,a/b.pow(d,e)).toFixed(2)
            +String.fromCharCode(160)+(e?'kMGTPEZY'[--e]+'B':'Bytes')
    }

    function getStoreByteLength( store ){
        var bytes = 0;
        for( var name in store ){
            bytes += store[ name ].buffer.byteLength;
        }
        return bytes;
    }

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
        unpackedByteLength: fileSizeSI( unpackedBytes ),
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

function showRandomAtomInfo( sd, id ){
    var atomInfo = getAtomInfo( sd, Math.floor( Math.random() * sd.atomCount ) );
    var atomInfoElm = document.getElementById( id );
    var atomInfoHtml = "";
    for( var name in atomInfo ){
        atomInfoHtml += name + ": " + atomInfo[ name ] + "<br/>";
    }
    atomInfoElm.innerHTML = atomInfoHtml;
}

function showStats( sd, id ){
    var stats = getStats( sd );
    var statsElm = document.getElementById( id );
    var statsHtml = "";
    for( var name in stats ){
        statsHtml += name + ": " + stats[ name ] + "<br/>";
    }
    statsElm.innerHTML = statsHtml;
}
