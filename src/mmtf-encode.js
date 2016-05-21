/**
 * @file mmtf-encode
 * @private
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

/**
 * mmtf encode module.
 * @module MmtfEncode
 */

import { PassThroughFields } from "./mmtf-constants.js";
import {
    getUint8View, getInt8View, getInt32, makeInt32Buffer,
    encodeRunLength, encodeDelta,
    encodeFloatSplitListDelta, encodeFloatRunLength
} from "./mmtf-utils.js";


function encodeMmtf( inputDict ){

    var outputDict = {

    };

    // copy some fields over from the input dict
    PassThroughFields.forEach( function( name ){
        if( inputDict[ name ] !== undefined ){
            outputDict[ name ] = inputDict[ name ];
        }
    } );

    var xCoordList = encodeFloatSplitListDelta( inputDict.xCoordList, 1000 );
    outputDict.xCoordBig = new Uint8Array( xCoordList[ 0 ] );
    outputDict.xCoordSmall = new Uint8Array( xCoordList[ 1 ] );

    var yCoordList = encodeFloatSplitListDelta( inputDict.yCoordList, 1000 );
    outputDict.yCoordBig = new Uint8Array( yCoordList[ 0 ] );
    outputDict.yCoordSmall = new Uint8Array( yCoordList[ 1 ] );

    var zCoordList = encodeFloatSplitListDelta( inputDict.zCoordList, 1000 );
    outputDict.zCoordBig = new Uint8Array( zCoordList[ 0 ] );
    outputDict.zCoordSmall = new Uint8Array( zCoordList[ 1 ] );

    outputDict.groupIdList = new Uint8Array(
        encodeRunLength( encodeDelta( inputDict.groupIdList ) )
    );

    outputDict.groupTypeList = new Uint8Array(
        makeInt32Buffer( inputDict.groupTypeList )
    );

    outputDict.chainIdList = inputDict.chainIdList;

    return outputDict;

}


export default encodeMmtf;
