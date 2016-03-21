/**
 * @file msgpack-decode
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import decodeMsgpack from "./msgpack-decode.js";

function getUint8View( dataArray ){
    return new Uint8Array(
        dataArray.buffer, dataArray.byteOffset, dataArray.byteLength
    );
}

function getInt8View( dataArray ){
    return new Int8Array(
        dataArray.buffer, dataArray.byteOffset, dataArray.byteLength
    );
}

function getInt16( view, dataArray, littleEndian ){
    var o = view.byteOffset;
    var n = view.byteLength;
    var i, i2, il;
    if( !dataArray ) dataArray = new Int16Array( n / 2 );
    if( littleEndian ){
        var dv = new DataView( view.buffer );
        for( i = 0, i2 = 0, il = n / 2; i < il; ++i, i2 += 2 ){
            dataArray[ i ] = dv.getInt16( o + i2, littleEndian );
        }
    }else{
        for( i = 0, i2 = 0, il = n / 2; i < il; ++i, i2 += 2 ){
            dataArray[ i ] = view[ i2 ] << 8 ^ view[ i2 + 1 ] << 0;
        }
    }
    return dataArray;
}

function getInt32( view, dataArray, littleEndian ){
    var o = view.byteOffset;
    var n = view.byteLength;
    var i, i4, il;
    if( !dataArray ) dataArray = new Int32Array( n / 4 );
    if( littleEndian ){
        var dv = new DataView( view.buffer );
        for( i = 0, i4 = 0, il = n / 4; i < il; ++i, i4 += 4 ){
            dataArray[ i ] = dv.getInt32( o + i4, littleEndian );
        }
    }else{
        for( i = 0, i4 = 0, il = n / 4; i < il; ++i, i4 += 4 ){
            dataArray[ i ] = (
                view[ i4     ] << 24 ^ view[ i4 + 1 ] << 16 ^
                view[ i4 + 2 ] <<  8 ^ view[ i4 + 3 ] <<  0
            );
        }
    }
    return dataArray;
}

function getInt32View( dataArray ){
    return new Int32Array(
        dataArray.buffer, dataArray.byteOffset, dataArray.byteLength/4
    );
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
    var int32 = decodeRunLength( getInt32( array, undefined, littleEndian ), int32View );
    return decodeFloat( int32, divisor, dataArray );
}

//

function decodeMmtf( binOrDict, params ){

    params = params || {};

    var littleEndian = params.littleEndian;
    var ignoreFields = params.ignoreFields || [];

    // make sure binOrDict is not a plain Arraybuffer
    if( binOrDict instanceof ArrayBuffer ){
        binOrDict = new Uint8Array( binOrDict );
    }

    var raw;
    if( binOrDict instanceof Uint8Array ){
        // get raw dict from msgpack
        raw = decodeMsgpack( binOrDict );
    }else{
        // already raw dict
        raw = binOrDict;
    }

    // // workaround
    if( raw.chainIdList === undefined && raw.chainList !== undefined ){
      raw.chainIdList = raw.chainList;
      raw.groupIdList = raw.groupNumList;
    }

    // determine what optional fields to decode
    var decodeBfactor = raw.bFactorBig && raw.bFactorSmall && ignoreFields.indexOf( "bFactor" ) === -1;
    var decodeAtomId = raw.atomIdList && ignoreFields.indexOf( "atomId" ) === -1;
    var decodeAltLabel = raw.altLabelList && ignoreFields.indexOf( "altLabel" ) === -1;
    var decodeInsCode = raw.insCodeList && ignoreFields.indexOf( "insCode" ) === -1;
    var decodeOccupancy = raw.occList && ignoreFields.indexOf( "occupancy" ) === -1;
    var decodeSecStruct = raw.secStructList && ignoreFields.indexOf( "secStruct" ) === -1;
    var decodeChainName = raw.chainNameList && ignoreFields.indexOf( "chainName" ) === -1;

    // hoisted loop variables
    var i, il, j, jl, k, kl;

    // counts
    var numBonds = raw.numBonds || 0;
    var numAtoms = raw.numAtoms || 0;
    var numGroups = raw.groupTypeList.length / 4;
    var numChains = raw.chainIdList.length / 4;
    var numModels = raw.chainsPerModel.length;

    // maps
    var groupMap = raw.groupMap;

    // bondStore
    var bAtomIndex1 = new Uint32Array( numBonds + numGroups );  // add numGroups
    var bAtomIndex2 = new Uint32Array( numBonds + numGroups );  // to have space
    var bBondOrder = new Uint8Array( numBonds + numGroups );    // for polymer bonds

    // atomStore
    var aGroupIndex = new Uint32Array( numAtoms );
    var aXcoord = new Float32Array( numAtoms );
    var aYcoord = new Float32Array( numAtoms );
    var aZcoord = new Float32Array( numAtoms );
    var aBfactor = decodeBfactor ? new Float32Array( numAtoms ) : undefined;
    var aAtomId = decodeAtomId ? new Int32Array( numAtoms ) : undefined;
    var aAltLabel = decodeAltLabel ? new Uint8Array( numAtoms ) : undefined;
    var aInsCode = decodeInsCode ? new Uint8Array( numAtoms ) : undefined;
    var aOccupancy = decodeOccupancy ? new Float32Array( numAtoms ) : undefined;

    // groupStore
    var gChainIndex = new Uint32Array( numGroups );
    var gAtomOffset = new Uint32Array( numGroups );
    var gAtomCount = new Uint16Array( numGroups );
    var gGroupTypeId = new Uint16Array( numGroups );
    var gGroupId = new Int32Array( numGroups );
    var gSecStruct = decodeSecStruct ? getInt8View( raw.secStructList ) : undefined;

    // chainStore
    var cModelIndex = new Uint16Array( numChains );
    var cGroupOffset = new Uint32Array( numChains );
    var cGroupCount = new Uint32Array( numChains );
    var cChainId = getUint8View( raw.chainIdList );
    var cChainName = decodeChainName ? getUint8View( raw.chainNameList ) : undefined;

    // modelStore
    var mChainOffset = new Uint32Array( numModels );
    var mChainCount = new Uint32Array( numModels );

    // split-list delta & integer decode x, y, z coords
    decodeFloatSplitList( raw.xCoordBig, raw.xCoordSmall, 1000, aXcoord, littleEndian );
    decodeFloatSplitList( raw.yCoordBig, raw.yCoordSmall, 1000, aYcoord, littleEndian );
    decodeFloatSplitList( raw.zCoordBig, raw.zCoordSmall, 1000, aZcoord, littleEndian );

    // split-list delta & integer decode b-factors
    if( decodeBfactor ){
        decodeFloatSplitList( raw.bFactorBig, raw.bFactorSmall, 100, aBfactor, littleEndian );
    }

    // delta & run-length decode atom ids
    if( decodeAtomId ){
        decodeDelta( decodeRunLength( getInt32( raw.atomIdList, undefined, littleEndian ), aAtomId ) );
    }

    // run-length decode alternate labels
    if( decodeAltLabel ){
        var rawAltLabelList = raw.altLabelList;
        for( i = 0, il = rawAltLabelList.length; i < il; i+=2 ){
            var rawAltLabel = rawAltLabelList[ i ];
            if( rawAltLabel === "?" ){
                rawAltLabelList[ i ] = 0;
            }else{
                rawAltLabelList[ i ] = rawAltLabel.charCodeAt( 0 );
            }
            rawAltLabelList[ i + 1 ] = parseInt( rawAltLabelList[ i + 1 ] );
        }
        decodeRunLength( rawAltLabelList, aAltLabel );
    }

    // run-length decode insertion codes
    if( decodeInsCode ){
        var rawInsCodeList = raw.insCodeList;
        for( i = 0, il = rawInsCodeList.length; i < il; i+=2 ){
            var rawInsCode = rawInsCodeList[ i ];
            if( rawInsCode === null ){
                rawInsCodeList[ i ] = 0;
            }else{
                rawInsCodeList[ i ] = rawInsCode.charCodeAt( 0 );
            }
            rawInsCodeList[ i + 1 ] = parseInt( rawInsCodeList[ i + 1 ] );
        }
        decodeRunLength( rawInsCodeList, aInsCode );
    }

    // run-length & integer decode occupancies
    if( decodeOccupancy ){
        decodeFloatRunLength( raw.occList, 100, aOccupancy, littleEndian );
    }

    // set-up model-chain relations
    var chainsPerModel = raw.chainsPerModel;
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
    var groupsPerChain = raw.groupsPerChain;
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
    decodeDelta( decodeRunLength( getInt32( raw.groupIdList, undefined, littleEndian ), gGroupId ) );

    // get group type pointers
    getInt32( raw.groupTypeList, gGroupTypeId, littleEndian );

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

        gAtomOffset[ i ] = atomOffset;
        gAtomCount[ i ] = groupAtomCount;

        for( j = 0; j < groupAtomCount; ++j ){
            aGroupIndex[ atomOffset ] = i;
            atomOffset += 1;
        }

    }

    if( raw.bondAtomList ){

        // console.log( getInt32( raw.bondAtomList, undefined, littleEndian ) );

        if( raw.bondOrderList ){
            var bondOrderList =  raw.bondOrderList;
            bBondOrder.set( bondOrderList, bondOffset );
        }

        var bondAtomList = getInt32( raw.bondAtomList, undefined, littleEndian );
        for( i = 0, il = bondAtomList.length; i < il; i += 2 ){
            bAtomIndex1[ bondOffset ] = bondAtomList[ i ];
            bAtomIndex2[ bondOffset ] = bondAtomList[ i + 1 ];
            bondOffset += 1;
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
            groupId: gGroupId,
            secStruct: gSecStruct
        },
        chainStore: {
            modelIndex: cModelIndex,
            groupOffset: cGroupOffset,
            groupCount: cGroupCount,
            chainId: cChainId,
            chainName: cChainName
        },
        modelStore: {
            chainOffset: mChainOffset,
            chainCount: mChainCount
        },

        groupMap: groupMap,

        unitCell: raw.unitCell,
        spaceGroup: raw.spaceGroup,
        bioAssembly: raw.bioAssembly,
        pdbId: raw.pdbId,
        title: raw.title,

        numBonds: numBonds,
        numAtoms: numAtoms,
        numGroups: numGroups,
        numChains: numChains,
        numModels: numModels,

        mmtfVersion: raw.mmtfVersion,
        mmtfProducer: raw.mmtfProducer
    };

}

export default decodeMmtf;
