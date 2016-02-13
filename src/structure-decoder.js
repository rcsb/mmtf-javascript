
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

function decodeFloatCombined( bigArray, smallArray, divisor, dataArray, littleEndian ){
    var int32View;
    if( dataArray ){
        int32View = new Int32Array(
            dataArray.buffer, dataArray.byteOffset, dataArray.byteLength/4
        );
    }
    var int32 = decodeSplitListDelta(
        getInt32( bigArray, undefined, littleEndian ),
        getInt16( smallArray, undefined, littleEndian ),
        int32View
    );
    return decodeFloat( int32, divisor, dataArray );
}

function getBondCount( msgpack, littleEndian ){
    var resOrder = msgpack.resOrder;
    var offset = resOrder.byteOffset;
    var length = resOrder.byteLength;
    var dv = new DataView( resOrder.buffer );

    var bondCount = 0;
    for( var gi, i = 0, il = length/4; i < il; ++i ){
        gi = dv.getInt32( offset + i * 4, littleEndian );
        bondCount += msgpack.groupMap[ gi ].bondOrders.length;
    }
    return bondCount;
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
    "-1": "",  // NA
};

function decodeStructure( bin ){

    if( bin instanceof ArrayBuffer ){
        bin = new Uint8Array( bin );
    }
    var msgpack = decodeMsgpack( bin );
    // console.log(getInt32( msgpack.resOrder))
    // console.log(msgpack)
    var i, il, j, jl, k, kl;

    var bondCount = getBondCount( msgpack );
    var atomCount = msgpack.numAtoms;
    var groupCount = msgpack.resOrder.length / 4;
    var chainCount = msgpack.chainList.length / 4;
    var modelCount = msgpack.chainsPerModel.length;
    var groupMap = msgpack.groupMap;

    // bondStore
    var bAtomIndex1 = new Uint32Array( bondCount + groupCount );  // add groupCount
    var bAtomIndex2 = new Uint32Array( bondCount + groupCount );  // to have space
    var bBondOrder = new Uint8Array( bondCount + groupCount );    // for polymer bonds

    // atomStore
    var aGroupIndex = new Uint32Array( atomCount );
    var aX = new Float32Array( atomCount );
    var aY = new Float32Array( atomCount );
    var aZ = new Float32Array( atomCount );
    var aBfactor = new Float32Array( atomCount );
    var aSerial = new Int32Array( atomCount );
    var aAltloc = new Uint8Array( atomCount );

    // groupStore
    var gChainIndex = new Uint32Array( groupCount );
    var gAtomOffset = new Uint32Array( groupCount );
    var gAtomCount = new Uint16Array( groupCount );
    var gGroupTypeId = new Uint16Array( groupCount );
    var gResno = new Int32Array( groupCount );
    var gSstruc = new Uint8Array( groupCount );

    // chainStore
    var cModelIndex = new Uint16Array( chainCount );
    var cGroupOffset = new Uint32Array( chainCount );
    var cGroupCount = new Uint32Array( chainCount );
    var cChainname = new Uint8Array( 4 * chainCount );

    // modelStore
    var mChainOffset = new Uint32Array( modelCount );
    var mChainCount = new Uint32Array( modelCount );

    decodeFloatCombined( msgpack.cartn_x_big, msgpack.cartn_x_small, 1000, aX );
    decodeFloatCombined( msgpack.cartn_y_big, msgpack.cartn_y_small, 1000, aY );
    decodeFloatCombined( msgpack.cartn_z_big, msgpack.cartn_z_small, 1000, aZ );
    if( msgpack.b_factor_big ){
        decodeFloatCombined( msgpack.b_factor_big, msgpack.b_factor_small, 100, aBfactor );
    }
    if( msgpack._atom_site_id ){
        decodeDelta( decodeRunLength( getInt32( msgpack._atom_site_id ), aSerial ) );
    }

    if( msgpack._atom_site_label_alt_id ){
        for( i = 0, il = msgpack._atom_site_label_alt_id.length; i < il; i+=2 ){
            var value = msgpack._atom_site_label_alt_id[ i ];
            if( value === "?" ){
                msgpack._atom_site_label_alt_id[ i ] = 0;
            }else{
                msgpack._atom_site_label_alt_id[ i ] = msgpack._atom_site_label_alt_id[ i ].charCodeAt( 0 );
            }
            msgpack._atom_site_label_alt_id[ i + 1 ] = parseInt( msgpack._atom_site_label_alt_id[ i + 1 ] );
        }
        decodeRunLength( msgpack._atom_site_label_alt_id, aAltloc );
    }

    if( msgpack._atom_site_pdbx_PDB_ins_code ){
        // FIXME
    }

    //

    getInt8( msgpack.chainList, cChainname );

    var chainsPerModel = msgpack.chainsPerModel;
    var modelChainCount;
    var chainOffset = 0;
    for( i = 0; i < modelCount; ++i ){
        modelChainCount = chainsPerModel[ i ];
        mChainOffset[ i ] = chainOffset;
        mChainCount[ i ] = modelChainCount;
        for( j = 0; j < modelChainCount; ++j ){
            cModelIndex[ j + chainOffset ] = i;
        }
        chainOffset += modelChainCount;
    }

    var groupsPerChain = msgpack.groupsPerChain;
    var chainGroupCount;
    var groupOffset = 0;
    for( i = 0; i < chainCount; ++i ){
        chainGroupCount = groupsPerChain[ i ];
        cGroupOffset[ i ] = groupOffset;
        cGroupCount[ i ] = chainGroupCount;
        for( j = 0; j < chainGroupCount; ++j ){
            gChainIndex[ j + groupOffset ] = i;
        }
        groupOffset += chainGroupCount;
    }

    //

    decodeDelta( decodeRunLength( getInt32( msgpack._atom_site_auth_seq_id ), gResno ) );

    var resOrder = getInt32( msgpack.resOrder, gGroupTypeId );
    var secStruct = getInt8( msgpack.secStruct );
    var atomOffset = 0;
    var bondOffset = 0;

    for( i = 0; i < groupCount; ++i ){

        var resData = groupMap[ resOrder[ i ] ];
        var atomInfo = resData.atomInfo;
        var resAtomCount = atomInfo.length / 2;

        var bondIndices = resData.bondIndices;
        var bondOrders = resData.bondOrders;

        for( j = 0, jl = bondOrders.length; j < jl; ++j ){
            bAtomIndex1[ bondOffset ] = atomOffset + bondIndices[ j * 2 ];
            bAtomIndex2[ bondOffset ] = atomOffset + bondIndices[ j * 2 + 1 ];
            bBondOrder[ bondOffset ] = bondOrders[ j ];
            bondOffset += 1;
        }

        //

        gSstruc[ i ] = ( sstrucMap[ secStruct[ i ] ] || "l" ).charCodeAt();
        gAtomOffset[ i ] = atomOffset;
        gAtomCount[ i ] = resAtomCount;

        for( j = 0; j < resAtomCount; ++j ){
            aGroupIndex[ atomOffset ] = i;
            atomOffset += 1;
        }

    }

    return {
        bondStore: {
            atomIndex1: bAtomIndex1,
            atomIndex2: bAtomIndex2,
            bondOrder: bBondOrder,
        },
        atomStore: {
            groupIndex: aGroupIndex,
            x: aX,
            y: aY,
            z: aZ,
            bfactor: aBfactor,
            serial: aSerial,
            altloc: aAltloc
        },
        groupStore: {
            chainIndex: gChainIndex,
            atomOffset: gAtomOffset,
            atomCount: gAtomCount,
            groupTypeId: gGroupTypeId,
            resno: gResno,
            sstruc: gSstruc
        },
        chainStore: {
            modelIndex: cModelIndex,
            groupOffset: cGroupOffset,
            groupCount: cGroupCount,
            chainname: cChainname
        },
        modelStore: {
            chainOffset: mChainOffset,
            chainCount: mChainCount
        },

        groupMap: groupMap,

        unitCell: msgpack.unitCell,
        spaceGroup: msgpack.spaceGroup,
        bioAssembly: msgpack.bioAssembly,
        pdbCode: msgpack.pdbCode,
        title: msgpack.title,

        bondCount: bondCount,
        atomCount: atomCount,
        groupCount: groupCount,
        chainCount: chainCount,
        modelCount: modelCount
    };

}

export default decodeStructure;
