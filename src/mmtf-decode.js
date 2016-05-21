/**
 * @file mmtf-decode
 * @private
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

/**
 * mmtf decode module.
 * @module MmtfDecode
 */

import { PassThroughFields } from "./mmtf-constants.js";
import {
    getUint8View, getInt8View, getInt32,
    decodeRunLength, decodeDelta,
    decodeFloatSplitListDelta, decodeFloatRunLength
} from "./mmtf-utils.js";


/**
 * Fields shared in encoded and decoded mmtf data objects.
 * @typedef {Object} module:MmtfDecode.SharedMmtfData
 * @property {String} mmtfVersion - MMTF specification version
 * @property {String} mmtfProducer - Program that created the file
 * @property {Float[]} [unitCell] - Crystallographic unit cell
 * @property {Float} unitCell.0 - x length
 * @property {Float} unitCell.1 - y length
 * @property {Float} unitCell.2 - z length
 * @property {Float} unitCell.3 - alpha angle
 * @property {Float} unitCell.4 - beta angle
 * @property {Float} unitCell.5 - gamma angle
 * @property {String} [spaceGroup] - Hermann-Mauguin symbol
 * @property {String} [structureId] - Some reference, e.g. a PDB ID
 * @property {String} [title] - Short description
 * @property {String} [depositionDate] - Deposition date in YYYY-MM-DD format
 * @property {String} [releaseDate] - Release date in YYYY-MM-DD format
 * @property {String[]} [experimentalMethods] - Structure determination methods
 * @property {Float} [resolution] - Resolution in Å
 * @property {Float} [rFree] - R-free value
 * @property {Float} [rWork] - R-work value
 * @property {Integer} numBonds - Number of bonds
 * @property {Integer} numAtoms - Number of atoms
 * @property {Integer} numGroups - Number of groups (residues)
 * @property {Integer} numChains - Number of chains
 * @property {Integer} numModels - Number of models
 * @property {Integer[]} chainsPerModel - List of number of chains in each model
 * @property {Integer[]} groupsPerChain - List of number of groups in each chain
 * @property {Entity[]} [entityList] - List of entity objects
 * @property {Integer[]} entityList.chainIndexList - Pointers into chain data fields
 * @property {String} entityList.description - Description of the entity
 * @property {String} entityList.type - Name of the entity type
 * @property {String} entityList.sequence - One letter code sequence
 * @property {Assembly[]} [bioAssemblyList] - List of assembly objects
 * @property {Transform[]} bioAssemblyList.transformList - List of transform objects
 * @property {Integer[]} bioAssemblyList.transformList.chainIndexList - Pointers into chain data fields
 * @property {Float[]} bioAssemblyList.transformList.matrix - 4x4 transformation matrix
 * @property {GroupType[]} groupList - List of groupType objects
 * @property {Integer[]} groupList.atomChargeList - List of atom formal charges
 * @property {String[]} groupList.elementList - List of elements
 * @property {String[]} groupList.atomNameList - List of atom names
 * @property {Integer[]} groupList.bondAtomList - List of bonded atom indices
 * @property {Integer[]} groupList.bondOrderList - List of bond orders
 * @property {String} groupList.groupName - The name of the group
 * @property {String} groupList.singleLetterCode - The single letter code
 * @property {String} groupList.chemCompType -  The chemical component type
 */

/**
 * Encoded mmtf data object. Also includes the fields from {@link module:MmtfDecode.SharedMmtfData}. See MMTF specification on how they are encoded.
 * @typedef {Object} module:MmtfDecode.EncodedMmtfData
 * @mixes module:MmtfDecode.SharedMmtfData
 * @property {Uint8Array} [bondAtomList] - Encoded bonded atom indices
 * @property {Uint8Array} [bondOrderList] - Encoded bond orders
 * @property {Uint8Array} xCoordBig - Encoded x coordinates in Å, part 1
 * @property {Uint8Array} xCoordSmall - Encoded x coordinates in Å, part 2
 * @property {Uint8Array} yCoordBig - Encoded y coordinates in Å, part 1
 * @property {Uint8Array} yCoordSmall - Encoded y coordinates in Å, part 2
 * @property {Uint8Array} yCoordBig - Encoded y coordinates in Å, part 1
 * @property {Uint8Array} yCoordSmall - Encoded y coordinates in Å, part 2
 * @property {Uint8Array} [bFactorBig] - Encoded B-factors in Å^2, part 1
 * @property {Uint8Array} [bFactorSmall] - Encoded B-factors in Å^2, part 2
 * @property {Uint8Array} [atomIdList] - Encoded  atom ids
 * @property {Uint8Array} [altLocList] - Encoded alternate location labels
 * @property {Uint8Array} [occupancyList] - Encoded occupancies
 * @property {Uint8Array} groupIdList - Encoded group ids
 * @property {Uint8Array} groupTypeList - Encoded group types
 * @property {Uint8Array} [secStructList] - Encoded secondary structure codes
 * @property {Uint8Array} [insCodeList] - Encoded insertion codes
 * @property {Uint8Array} [seuenceIdList] - Encoded sequence ids
 * @property {Uint8Array} chainIdList - Encoded chain ids
 * @property {Uint8Array} [chainNameList] - Encoded chain names
 */

/**
 * Decoded mmtf data object. Also includes fields the from {@link module:MmtfDecode.SharedMmtfData}.
 * @typedef {Object} module:MmtfDecode.MmtfData
 * @mixes module:MmtfDecode.SharedMmtfData
 * @property {Int32Array} [bondAtomList] - List of bonded atom indices
 * @property {Uint8Array} [bondOrderList] - List of bond orders
 * @property {Float32Array} xCoordList - List of x coordinates in Å
 * @property {Float32Array} yCoordList - List of y coordinates in Å
 * @property {Float32Array} zCoordList - List of z coordinates in Å
 * @property {Float32Array} [bFactorList] - List of B-factors in Å^2
 * @property {Int32Array} [atomIdList] - List of atom ids
 * @property {Uint8Array} [altLocList] - List of alternate location labels
 * @property {Float32Array} [occupancyList] - List of occupancies
 * @property {Int32Array} groupIdList - List of group ids
 * @property {Int32Array} groupTypeList - List of group types
 * @property {Int8Array} [secStructList] - List of secondary structure codes, encoding
 *    0: pi helix, 1: bend, 2: alpha helix, 3: extended,
 *    4: 3-10 helix, 5: bridge, 6: turn, 7: coil, -1: undefined
 * @property {Uint8Array} [insCodeList] - List of insertion codes
 * @property {Int32Array} [seuenceIdList] - List of sequence ids
 * @property {Uint8Array} chainIdList - List of chain ids
 * @property {Uint8Array} [chainNameList] - List of chain names
 */


/**
 * Decode MMTF fields
 * @static
 * @param  {Object} inputDict - encoded MMTF data
 * @param  {Object} [params] - decoding parameters
 * @param  {String[]} params.ignoreFields - names of optional fields not to decode
 * @return {module:MmtfDecode.MmtfData} mmtfData
 */
function decodeMmtf( inputDict, params ){

    params = params || {};

    var ignoreFields = params.ignoreFields;

    // helper function to tell if a field should be decoded
    function decodeField( name ){
        return ignoreFields ? ignoreFields.indexOf( name ) === -1 : true;
    }

    // hoisted loop variables
    var i, il;

    // get counts
    var numBonds = inputDict.numBonds || 0;
    var numAtoms = inputDict.numAtoms || 0;
    var numGroups = inputDict.groupTypeList.length / 4;
    var numChains = inputDict.chainIdList.length / 4;
    var numModels = inputDict.chainsPerModel.length;

    // initialize output dict
    var outputDict = {
        numGroups: numGroups,
        numChains: numChains,
        numModels: numModels
    };

    // copy some fields over from the input dict
    PassThroughFields.forEach( function( name ){
        if( inputDict[ name ] !== undefined ){
            outputDict[ name ] = inputDict[ name ];
        }
    } );

    //////////////
    // bond data

    // decode inter group bond atom indices, i.e. get int32 array
    var bondAtomListKey = "bondAtomList";
    if( inputDict[ bondAtomListKey ] && decodeField( bondAtomListKey ) ){
        outputDict[ bondAtomListKey ] = getInt32( inputDict[ bondAtomListKey ] );
    }

    // decode inter group bond orders, i.e. get uint8 array
    var bondOrderListKey = "bondOrderList";
    if( inputDict[ bondOrderListKey ] && decodeField( bondOrderListKey ) ){
        outputDict[ bondOrderListKey ] = getUint8View( inputDict[ bondOrderListKey ] );
    }

    //////////////
    // atom data

    // split-list delta & integer decode x, y, z atom coords
    outputDict.xCoordList = decodeFloatSplitListDelta(
        inputDict.xCoordBig, inputDict.xCoordSmall, 1000
    );
    outputDict.yCoordList = decodeFloatSplitListDelta(
        inputDict.yCoordBig, inputDict.yCoordSmall, 1000
    );
    outputDict.zCoordList = decodeFloatSplitListDelta(
        inputDict.zCoordBig, inputDict.zCoordSmall, 1000
    );

    // split-list delta & integer decode b-factors
    var bFactorListKey = "bFactorList";
    var bFactorBigKey = "bFactorBig";
    var bFactorSmallKey = "bFactorSmall";
    if( inputDict[ bFactorBigKey ] && inputDict[ bFactorSmallKey ] && decodeField( bFactorListKey ) ){
        outputDict[ bFactorListKey ] = decodeFloatSplitListDelta(
            inputDict[ bFactorBigKey ], inputDict[ bFactorSmallKey ], 100
        );
    }

    // delta & run-length decode atom ids
    var atomIdListKey = "atomIdList";
    if( inputDict[ atomIdListKey ] && decodeField( atomIdListKey ) ){
        outputDict[ atomIdListKey ] = decodeDelta(
            decodeRunLength( getInt32( inputDict[ atomIdListKey ] ) )
        );
    }

    // run-length decode alternate labels
    var altLocListKey = "altLocList";
    if( inputDict[ altLocListKey ] && decodeField( altLocListKey ) ){
        outputDict[ altLocListKey ] = decodeRunLength(
            getInt32( inputDict[ altLocListKey ] ), new Uint8Array( numAtoms )
        );
    }

    // run-length & integer decode occupancies
    var occupancyListKey = "occupancyList";
    if( inputDict[ occupancyListKey ] && decodeField( occupancyListKey ) ){
        outputDict[ occupancyListKey ] = decodeFloatRunLength( inputDict[ occupancyListKey ], 100 );
    }

    ///////////////
    // group data

    // run-length & delta decode group numbers
    outputDict.groupIdList = decodeDelta(
        decodeRunLength( getInt32( inputDict.groupIdList ) )
    );

    // decode group types, i.e. get int32 array
    outputDict.groupTypeList = getInt32( inputDict.groupTypeList );

    // decode secondary structure, i.e. get int8 view
    var secStructListKey = "secStructList";
    if( inputDict[ secStructListKey ] && decodeField( secStructListKey ) ){
        outputDict[ secStructListKey ] = getInt8View( inputDict[ secStructListKey ] );
    }

    // run-length decode insertion codes
    var insCodeListKey = "insCodeList";
    if( inputDict[ insCodeListKey ] && decodeField( insCodeListKey ) ){
        outputDict[ insCodeListKey ] = decodeRunLength(
            getInt32( inputDict[ insCodeListKey ] ), new Uint8Array( numGroups )
        );
    }

    // run-length & delta decode sequence indices
    var sequenceIndexListKey = "sequenceIndexList";
    if( inputDict[ sequenceIndexListKey ] && decodeField( sequenceIndexListKey ) ){
        outputDict[ sequenceIndexListKey ] = decodeDelta(
            decodeRunLength( getInt32( inputDict[ sequenceIndexListKey ] ) )
        );
    }

    ///////////////
    // chain data

    // decode chain ids, i.e. get int8 view
    outputDict.chainIdList = getUint8View( inputDict.chainIdList );

    // decode chain names, i.e. get int8 view
    var chainNameListKey = "chainNameList";
    if( inputDict[ chainNameListKey ] && decodeField( chainNameListKey ) ){
        outputDict[ chainNameListKey ] = getUint8View( inputDict[ chainNameListKey ] );
    }

    return outputDict;

}

export default decodeMmtf;
