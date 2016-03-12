'use strict';

// TODO license and attribution


function decodeMsgpack(buffer) {
  var offset = 0;
  var dataView = new DataView(buffer.buffer);

  function map(length) {
    var value = {};
    for (var i = 0; i < length; i++) {
      var key = parse();
      value[key] = parse();
    }
    return value;
  }

  function bin(length) {
    var value = buffer.subarray(offset, offset + length);
    offset += length;
    return value;
  }

  function str(length) {
    var array = buffer.subarray(offset, offset + length);
    offset += length;
    // limit number of arguments to String.fromCharCode to something
    // browsers can handle, see http://stackoverflow.com/a/22747272
    var chunkSize = 0xffff;
    if(length > chunkSize){
      var c = [];
      for(var i = 0; i < array.length; i += chunkSize) {
        c.push(String.fromCharCode.apply(
          null, array.subarray(i, i + chunkSize)
        ));
      }
      return c.join("");
    }else{
      return String.fromCharCode.apply(null, array);
    }
  }

  function array(length) {
    var value = new Array(length);
    for (var i = 0; i < length; i++) {
      value[i] = parse();
    }
    return value;
  }

  function parse() {
    var type = buffer[offset];
    var value, length, extType;
    // Positive FixInt
    if ((type & 0x80) === 0x00) {
      offset++;
      return type;
    }
    // FixMap
    if ((type & 0xf0) === 0x80) {
      length = type & 0x0f;
      offset++;
      return map(length);
    }
    // FixArray
    if ((type & 0xf0) === 0x90) {
      length = type & 0x0f;
      offset++;
      return array(length);
    }
    // FixStr
    if ((type & 0xe0) === 0xa0) {
      length = type & 0x1f;
      offset++;
      return str(length);
    }
    // Negative FixInt
    if ((type & 0xe0) === 0xe0) {
      value = dataView.getInt8(offset);
      offset++;
      return value;
    }
    switch (type) {
    // nil
    case 0xc0:
      offset++;
      return null;
    // 0xc1: (never used)
    // false
    case 0xc2:
      offset++;
      return false;
    // true
    case 0xc3:
      offset++;
      return true;
    // bin 8
    case 0xc4:
      length = dataView.getUint8(offset + 1);
      offset += 2;
      return bin(length);
    // bin 16
    case 0xc5:
      length = dataView.getUint16(offset + 1);
      offset += 3;
      return bin(length);
    // bin 32
    case 0xc6:
      length = dataView.getUint32(offset + 1);
      offset += 5;
      return bin(length);
    // ext 8
    case 0xc7:
      length = dataView.getUint8(offset + 1);
      extType = dataView.getUint8(offset + 2);
      offset += 3;
      return [extType, bin(length)];
    // ext 16
    case 0xc8:
      length = dataView.getUint16(offset + 1);
      extType = dataView.getUint8(offset + 3);
      offset += 4;
      return [extType, bin(length)];
    // ext 32
    case 0xc9:
      length = dataView.getUint32(offset + 1);
      extType = dataView.getUint8(offset + 5);
      offset += 6;
      return [extType, bin(length)];
    // float 32
    case 0xca:
      value = dataView.getFloat32(offset + 1);
      offset += 5;
      return value;
    // float 64
    case 0xcb:
      value = dataView.getFloat64(offset + 1);
      offset += 9;
      return value;
    // uint8
    case 0xcc:
      value = buffer[offset + 1];
      offset += 2;
      return value;
    // uint 16
    case 0xcd:
      value = dataView.getUint16(offset + 1);
      offset += 3;
      return value;
    // uint 32
    case 0xce:
      value = dataView.getUint32(offset + 1);
      offset += 5;
      return value;
    // uint64
    case 0xcf:
      // FIXME not available/representable in JS
      // largest possible int in JS is 2^53
      // value = dataView.getUint64(offset + 1);
      offset += 9;
      return 0;
    // int 8
    case 0xd0:
      value = dataView.getInt8(offset + 1);
      offset += 2;
      return value;
    // int 16
    case 0xd1:
      value = dataView.getInt16(offset + 1);
      offset += 3;
      return value;
    // int 32
    case 0xd2:
      value = dataView.getInt32(offset + 1);
      offset += 5;
      return value;
    // int 64
    case 0xd3:
      // FIXME not available/representable in JS
      // largest possible int in JS is 2^53
      // value = dataView.getInt64(offset + 1);
      offset += 9;
      return 0;

    // fixext 1
    case 0xd4:
      extType = dataView.getUint8(offset + 1);
      offset += 2;
      return [extType, bin(1)];
    // fixext 2
    case 0xd5:
      extType = dataView.getUint8(offset + 1);
      offset += 2;
      return [extType, bin(2)];
    // fixext 4
    case 0xd6:
      extType = dataView.getUint8(offset + 1);
      offset += 2;
      return [extType, bin(4)];
    // fixext 8
    case 0xd7:
      extType = dataView.getUint8(offset + 1);
      offset += 2;
      return [extType, bin(8)];
    // fixext 16
    case 0xd8:
      extType = dataView.getUint8(offset + 1);
      offset += 2;
      return [extType, bin(16)];
    // str 8
    case 0xd9:
      length = dataView.getUint8(offset + 1);
      offset += 2;
      return str(length);
    // str 16
    case 0xda:
      length = dataView.getUint16(offset + 1);
      offset += 3;
      return str(length);
    // str 32
    case 0xdb:
      length = dataView.getUint32(offset + 1);
      offset += 5;
      return str(length);
    // array 16
    case 0xdc:
      length = dataView.getUint16(offset + 1);
      offset += 3;
      return array(length);
    // array 32
    case 0xdd:
      length = dataView.getUint32(offset + 1);
      offset += 5;
      return array(length);
    // map 16:
    case 0xde:
      length = dataView.getUint16(offset + 1);
      offset += 3;
      return map(length);
    // map 32
    case 0xdf:
      length = dataView.getUint32(offset + 1);
      offset += 5;
      return map(length);
    }

    throw new Error("Unknown type 0x" + type.toString(16));
  }

  return parse();
}

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

function decodeMmtf( binOrDict, littleEndian ){

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
    if( raw.chainIdList === undefined ){
      raw.chainIdList = raw.chainList;
      raw.groupIdList = raw.groupNumList;
    }

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
    var gGroupId = new Int32Array( numGroups );
    var gSecStruct = getInt8View( raw.secStructList );  // get secondary structure codes  // new Uint8Array( numGroups );

    // chainStore
    var cModelIndex = new Uint16Array( numChains );
    var cGroupOffset = new Uint32Array( numChains );
    var cGroupCount = new Uint32Array( numChains );
    var cChainName = getUint8View( raw.chainIdList );  // get ascii encoded chain names  // new Uint8Array( 4 * numChains );

    // modelStore
    var mChainOffset = new Uint32Array( numModels );
    var mChainCount = new Uint32Array( numModels );

    // split-list delta & integer decode x, y, z coords
    decodeFloatSplitList( raw.xCoordBig, raw.xCoordSmall, 1000, aXcoord, littleEndian );
    decodeFloatSplitList( raw.yCoordBig, raw.yCoordSmall, 1000, aYcoord, littleEndian );
    decodeFloatSplitList( raw.zCoordBig, raw.zCoordSmall, 1000, aZcoord, littleEndian );

    // split-list delta & integer decode b-factors
    if( raw.bFactorBig && raw.bFactorSmall ){
        decodeFloatSplitList( raw.bFactorBig, raw.bFactorSmall, 100, aBfactor, littleEndian );
    }

    // delta & run-length decode atom ids
    if( raw.atomIdList ){
        decodeDelta( decodeRunLength( getInt32( raw.atomIdList, undefined, littleEndian ), aAtomId ) );
    }

    // run-length decode alternate labels
    if( raw.altLabelList ){
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
    if( raw.insCodeList ){
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
    if( raw.occList ){
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
        numModels: numModels
    };

}

module.exports = decodeMmtf;