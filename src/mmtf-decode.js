
import decodeMsgpack from "./msgpack-decode.js";


function getInt8( view, dataArray ){
    var dv = new DataView( view.buffer );
    var o = view.byteOffset;
    var n = view.byteLength;
    if( !dataArray ) dataArray = new Int8Array( n );
    for( var i = 0; i < n; ++i ){
        dataArray[ i ] = dv.getInt8( o+i );
    }
    return dataArray;
}

function getInt16( view, dataArray, littleEndian ){
    var dv = new DataView( view.buffer );
    var o = view.byteOffset;
    var n = view.byteLength;
    if( !dataArray ) dataArray = new Int16Array( n / 2 );
    for( var i = 0, il = n / 2; i < il; ++i ){
        dataArray[ i ] = dv.getInt16( o + i * 2, littleEndian );
    }
    return dataArray;
}

function getInt32( view, dataArray, littleEndian ){
    var dv = new DataView( view.buffer );
    var o = view.byteOffset;
    var n = view.byteLength;
    if( !dataArray ) dataArray = new Int32Array( n / 4 );
    for( var i = 0, il = n / 4; i < il; ++i ){
        dataArray[ i ] = dv.getInt32( o + i * 4, littleEndian );
    }
    return dataArray;
}

function decodeFloat( intArray, divisor, dataArray ){
    var n = intArray.length;
    var invDiv = 1/divisor;
    if( !dataArray ) dataArray = new Float32Array( n );
    for( var i = 0; i < n; ++i ){
        dataArray[ i ] = intArray[ i ] * invDiv;
    }
    return dataArray;
}

function decodeRunLength( array, dataArray ){
    var i, il;
    if( !dataArray ){
        var fullLength = 0;
        for( i = 0, il = array.length; i < il; i+=2 ){
            fullLength += array[ i + 1 ];
        }
        dataArray = new array.constructor( fullLength );
    }
    var dataOffset = 0;
    for( i = 0, il = array.length; i < il; i+=2 ){
        var value = array[ i ];
        var length = array[ i + 1 ];
        for( var j = 0; j < length; ++j ){
            dataArray[ dataOffset ] = value;
            dataOffset += 1;
        }
    }
    return dataArray;
}

function decodeDelta( dataArray ){
    for( var i = 1, il = dataArray.length; i < il; ++i ){
        dataArray[ i ] += dataArray[ i - 1 ];
    }
    return dataArray;
}

function getInt32View( dataArray ){
    return new Int32Array(
        dataArray.buffer, dataArray.byteOffset, dataArray.byteLength/4
    );
}

function decodeSplitListDelta( bigArray, smallArray, dataArray ){
    var fullLength = ( bigArray.length / 2 ) + smallArray.length;
    if( !dataArray ) dataArray = new Int32Array( fullLength );
    var dataOffset = 0;
    var smallOffset = 0;
    for( var i = 0, il = bigArray.length; i < il; i+=2 ){
        var value = bigArray[ i ];
        var length = bigArray[ i + 1 ];
        dataArray[ dataOffset ] = value;
        if( i !== 0 ){
            dataArray[ dataOffset ] += dataArray[ dataOffset - 1 ];
        }
        dataOffset += 1;
        for( var j = 0; j < length; ++j ){
            dataArray[ dataOffset ] = dataArray[ dataOffset - 1 ] + smallArray[ smallOffset ];
            dataOffset += 1;
            smallOffset += 1;
        }
    }
    return dataArray;
}

function decodeFloatSplitList( bigArray, smallArray, divisor, dataArray, littleEndian ){
    var int32View = dataArray ? getInt32View( dataArray ) : undefined;
    var int32 = decodeSplitListDelta(
        getInt32( bigArray, undefined, littleEndian ),
        getInt16( smallArray, undefined, littleEndian ),
        int32View
    );
    return decodeFloat( int32, divisor, dataArray );
}

function decodeFloatRunLength( array, divisor, dataArray, littleEndian ){
    var int32View = dataArray ? getInt32View( dataArray ) : undefined;
    var int32 = decodeRunLength( getInt32( array, undefined, littleEndian ), int32View )
    return decodeFloat( int32, divisor, dataArray );
}

//

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

function decodeMmtf( bin ){

    // make sure bin is not a plain Arraybuffer
    if( bin instanceof ArrayBuffer ){
        bin = new Uint8Array( bin );
    }

    // get decoded msgpack data
    var msgpack = decodeMsgpack( bin );

    // console.log(getInt32( msgpack.resOrder))
    console.log(msgpack)

    // hoisted loop variables
    var i, il, j, jl, k, kl;

    // counts
    var numBonds = msgpack.numBonds;
    var numAtoms = msgpack.numAtoms;
    var numGroups = msgpack.groupTypeList.length / 4;
    var numChains = msgpack.chainList.length / 4;
    var numModels = msgpack.chainsPerModel.length;

    // maps
    var groupMap = msgpack.groupMap;

    // bondStore
    var bAtomIndex1 = new Uint32Array( numBonds + numGroups );  // add numGroups
    var bAtomIndex2 = new Uint32Array( numBonds + numGroups );  // to have space
    var bBondOrder = new Uint8Array( numBonds + numGroups );    // for polymer bonds

    // atomStore
    var aGroupIndex = new Uint32Array( numAtoms );
    var aXcoord = new Float32Array( numAtoms );
    var aYcoord = new Float32Array( numAtoms );
    var aZcoord = new Float32Array( numAtoms );
    var aBfactor = new Float32Array( numAtoms );
    var aAtomId = new Int32Array( numAtoms );
    var aAltLabel = new Uint8Array( numAtoms );
    var aInsCode = new Uint8Array( numAtoms );
    var aOccupancy = new Float32Array( numAtoms );

    // groupStore
    var gChainIndex = new Uint32Array( numGroups );
    var gAtomOffset = new Uint32Array( numGroups );
    var gAtomCount = new Uint16Array( numGroups );
    var gGroupTypeId = new Uint16Array( numGroups );
    var gGroupNum = new Int32Array( numGroups );
    var gSecStruct = new Uint8Array( numGroups );

    // chainStore
    var cModelIndex = new Uint16Array( numChains );
    var cGroupOffset = new Uint32Array( numChains );
    var cGroupCount = new Uint32Array( numChains );
    var cChainName = new Uint8Array( 4 * numChains );

    // modelStore
    var mChainOffset = new Uint32Array( numModels );
    var mChainCount = new Uint32Array( numModels );

    // split-list delta & integer decode x, y, z coords
    decodeFloatSplitList( msgpack.xCoordBig, msgpack.xCoordSmall, 1000, aXcoord );
    decodeFloatSplitList( msgpack.yCoordBig, msgpack.yCoordSmall, 1000, aYcoord );
    decodeFloatSplitList( msgpack.zCoordBig, msgpack.zCoordSmall, 1000, aZcoord );

    // split-list delta & integer decode b-factors
    if( msgpack.bFactorBig && msgpack.bFactorSmall ){
        decodeFloatSplitList( msgpack.bFactorBig, msgpack.bFactorSmall, 100, aBfactor );
    }

    // delta & run-length decode atom ids
    if( msgpack.atomIdList ){
        decodeDelta( decodeRunLength( getInt32( msgpack.atomIdList ), aAtomId ) );
    }

    // run-length decode altternate labels
    if( msgpack.altLabelList ){
        var msgpackAltLabelList = msgpack.altLabelList;
        for( i = 0, il = msgpackAltLabelList.length; i < il; i+=2 ){
            var value = msgpackAltLabelList[ i ];
            if( value === "?" ){
                msgpackAltLabelList[ i ] = 0;
            }else{
                msgpackAltLabelList[ i ] = msgpackAltLabelList[ i ].charCodeAt( 0 );
            }
            msgpackAltLabelList[ i + 1 ] = parseInt( msgpackAltLabelList[ i + 1 ] );
        }
        decodeRunLength( msgpackAltLabelList, aAltLabel );
    }

    // run-length decode insertion codes
    if( msgpack.insCodeList ){
        var msgpackInsCodeList = msgpack.insCodeList;
        for( i = 0, il = msgpackInsCodeList.length; i < il; i+=2 ){
            var value = msgpackInsCodeList[ i ];
            if( value === null ){
                msgpackInsCodeList[ i ] = 0;
            }else{
                msgpackInsCodeList[ i ] = msgpackInsCodeList[ i ].charCodeAt( 0 );
            }
            msgpackInsCodeList[ i + 1 ] = parseInt( msgpackInsCodeList[ i + 1 ] );
        }
        decodeRunLength( msgpackInsCodeList, aInsCode );
    }

    // run-length & integer decode occupancies
    if( msgpack.occList ){
        decodeFloatRunLength( msgpack.occList, 100, aOccupancy );
    }

    // get ascii encoded chain names
    getInt8( msgpack.chainList, cChainName );

    // set-up model-chain relations
    var chainsPerModel = msgpack.chainsPerModel;
    var modelChainCount;
    var chainOffset = 0;
    for( i = 0; i < numModels; ++i ){
        modelChainCount = chainsPerModel[ i ];
        mChainOffset[ i ] = chainOffset;
        mChainCount[ i ] = modelChainCount;
        for( j = 0; j < modelChainCount; ++j ){
            cModelIndex[ j + chainOffset ] = i;
        }
        chainOffset += modelChainCount;
    }

    // set-up chain-residue relations
    var groupsPerChain = msgpack.groupsPerChain;
    var chainGroupCount;
    var groupOffset = 0;
    for( i = 0; i < numChains; ++i ){
        chainGroupCount = groupsPerChain[ i ];
        cGroupOffset[ i ] = groupOffset;
        cGroupCount[ i ] = chainGroupCount;
        for( j = 0; j < chainGroupCount; ++j ){
            gChainIndex[ j + groupOffset ] = i;
        }
        groupOffset += chainGroupCount;
    }

    // run-length & delta decode group numbers
    decodeDelta( decodeRunLength( getInt32( msgpack.groupNumList ), gGroupNum ) );

    // get group type pointers
    getInt32( msgpack.groupTypeList, gGroupTypeId );

    // get secondary structure codes
    var secStruct = getInt8( msgpack.secStructList );

    //////
    // get data from group map

    var atomOffset = 0;
    var bondOffset = 0;

    for( i = 0; i < numGroups; ++i ){

        var groupData = groupMap[ gGroupTypeId[ i ] ];
        var atomInfo = groupData.atomInfo;
        var groupAtomCount = atomInfo.length / 2;

        var bondIndices = groupData.bondIndices;
        var bondOrders = groupData.bondOrders;

        for( j = 0, jl = bondOrders.length; j < jl; ++j ){
            bAtomIndex1[ bondOffset ] = atomOffset + bondIndices[ j * 2 ];
            bAtomIndex2[ bondOffset ] = atomOffset + bondIndices[ j * 2 + 1 ];
            bBondOrder[ bondOffset ] = bondOrders[ j ];
            bondOffset += 1;
        }

        //

        gSecStruct[ i ] = ( sstrucMap[ secStruct[ i ] ] || "l" ).charCodeAt();  // FIXME move out
        gAtomOffset[ i ] = atomOffset;
        gAtomCount[ i ] = groupAtomCount;

        for( j = 0; j < groupAtomCount; ++j ){
            aGroupIndex[ atomOffset ] = i;
            atomOffset += 1;
        }

    }

    // if( msgpack.bondAtomList ){

    //     console.log( getInt32( msgpack.bondAtomList ) );

    //     if( msgpack.bondOrderList ){
    //         var bondOrderList =  msgpack.bondOrderList;
    //         bBondOrder.set( bondOrderList, bondOffset );
    //     }

    //     var bondAtomList = getInt32( msgpack.bondAtomList );
    //     for( i = 0, il = bondAtomList.length; i < il; i += 2 ){
    //         bAtomIndex1[ bondOffset ] = bondAtomList[ i ];
    //         bAtomIndex2[ bondOffset ] = bondAtomList[ i + 1 ];
    //         bondOffset += 1;
    //     }

    // }

    return {
        bondStore: {
            atomIndex1: bAtomIndex1,
            atomIndex2: bAtomIndex2,
            bondOrder: bBondOrder,
        },
        atomStore: {
            groupIndex: aGroupIndex,
            xCoord: aXcoord,
            yCoord: aYcoord,
            zCoord: aZcoord,
            bFactor: aBfactor,
            atomId: aAtomId,
            altLabel: aAltLabel,
            insCode: aInsCode,
            occupancy: aOccupancy
        },
        groupStore: {
            chainIndex: gChainIndex,
            atomOffset: gAtomOffset,
            atomCount: gAtomCount,
            groupTypeId: gGroupTypeId,
            groupNum: gGroupNum,
            secStruct: gSecStruct
        },
        chainStore: {
            modelIndex: cModelIndex,
            groupOffset: cGroupOffset,
            groupCount: cGroupCount,
            chainName: cChainName
        },
        modelStore: {
            chainOffset: mChainOffset,
            chainCount: mChainCount
        },

        groupMap: groupMap,

        unitCell: msgpack.unitCell,
        spaceGroup: msgpack.spaceGroup,
        bioAssembly: msgpack.bioAssembly,
        pdbId: msgpack.pdbId,
        title: msgpack.title,

        numBonds: numBonds,
        numAtoms: numAtoms,
        numGroups: numGroups,
        numChains: numChains,
        numModels: numModels
    };

}

export default decodeMmtf;
