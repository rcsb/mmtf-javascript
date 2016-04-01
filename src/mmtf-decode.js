/**
 * @file msgpack-decode
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import decodeMsgpack from "./msgpack-decode.js";

import {
    getUint8View, getInt8View, getInt16, getInt32, getInt32View,
    decodeFloat, decodeRunLength, decodeDelta, decodeSplitListDelta,
    decodeFloatSplitList, decodeFloatRunLength
} from "./mmtf-decode-helpers.js";

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
    var decodeOccupancy = raw.occList && ignoreFields.indexOf( "occupancy" ) === -1;
    var decodeSecStruct = raw.secStructList && ignoreFields.indexOf( "secStruct" ) === -1;
    var decodeInsCode = raw.insCodeList && ignoreFields.indexOf( "insCode" ) === -1;
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
    var aOccupancy = decodeOccupancy ? new Float32Array( numAtoms ) : undefined;

    // groupStore
    var gChainIndex = new Uint32Array( numGroups );
    var gAtomOffset = new Uint32Array( numGroups );
    var gAtomCount = new Uint16Array( numGroups );
    var gGroupTypeId = new Uint16Array( numGroups );
    var gGroupId = new Int32Array( numGroups );
    var gSecStruct = decodeSecStruct ? getInt8View( raw.secStructList ) : undefined;
    var gInsCode = decodeInsCode ? new Uint8Array( numGroups ) : undefined;

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
        decodeRunLength( rawInsCodeList, gInsCode );
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
            occupancy: aOccupancy
        },
        groupStore: {
            chainIndex: gChainIndex,
            atomOffset: gAtomOffset,
            atomCount: gAtomCount,
            groupTypeId: gGroupTypeId,
            groupId: gGroupId,
            secStruct: gSecStruct,
            insCode: gInsCode
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
        bioAssemblyList: raw.bioAssemblyList,
        pdbId: raw.pdbId,
        title: raw.title,
        entityList: raw.entityList,

        experimentalMethods: raw.experimentalMethods,
        resolution: raw.resolution,
        rFree: raw.rFree,
        rWork: raw.rWork,

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
