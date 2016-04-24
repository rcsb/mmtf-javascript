/**
 * @file mmtf-traverse
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

/**
 * Converts an array of ASCII codes trimming '\0' bytes
 * @param  {Array} charCodeArray - array of ASCII char codes
 * @return {String} '\0' trimmed string
 */
function fromCharCode( charCodeArray ){
    return String.fromCharCode.apply( null, charCodeArray ).replace(/\0/g, '');
}

/**
 * Traverse the MMTF structure data.
 * @class
 * @param {Object} mmtfData - decoded mmtf data
 * @param {Object} callbackDict - callback functions
 *  - @param {Function} callbackDict.onModel(modelData) - called for each model
 *     - @param {Integer} modelData.chainCount
 *     - @param {Integer} modelData.modelIndex
 *  - @param {Function} callbackDict.onChain(chainData) - called for each chain
 *     - @param {Integer} chainData.groupCount
 *     - @param {Integer} chainData.chainIndex
 *     - @param {Integer} chainData.modelIndex
 *     - @param {String} chainData.chainId
 *     - @param {String|null} chainData.chainName
 *  - @param {Function} callbackDict.onGroup(groupData) - called for each group
 *     - @param {Integer} groupData.atomCount
 *     - @param {Integer} groupData.groupIndex
 *     - @param {Integer} groupData.chainIndex
 *     - @param {Integer} groupData.modelIndex
 *     - @param {Integer} groupData.groupId
 *     - @param {Integer} groupData.groupType
 *     - @param {String} groupData.groupName
 *     - @param {Char} groupData.singleLetterCode
 *     - @param {String} groupData.chemCompType
 *     - @param {Integer|null} groupData.secStruct
 *     - @param {Char|null} groupData.insCode
 *     - @param {Integer|null} groupData.sequenceIndex
 *  - @param {Function} callbackDict.onAtom(atomData) - called for each atom
 *     - @param {Integer} atomData.atomIndex
 *     - @param {Integer} atomData.groupIndex
 *     - @param {Integer} atomData.chainIndex
 *     - @param {Integer} atomData.modelIndex
 *     - @param {Integer} atomData.atomId
 *     - @param {String} atomData.element
 *     - @param {String} atomData.atomName
 *     - @param {Integer} atomData.atomCharge
 *     - @param {Float} atomData.xCoord
 *     - @param {Float} atomData.yCoord
 *     - @param {Float} atomData.zCoord
 *     - @param {Float|null} atomData.bFactor
 *     - @param {Char|null} atomData.altLoc
 *     - @param {Float|null} atomData.occupancy
 *  - @param {Function} callbackDict.onBond(bondData) - called for each bond
 *     - @param {Integer} bondData.atomIndex1
 *     - @param {Integer} bondData.atomIndex2
 *     - @param {Integer} bondData.bondOrder
 */
function traverseMmtf( mmtfData, callbackDict ){

    // setup callback functions
    var onModel = callbackDict.onModel;
    var onChain = callbackDict.onChain;
    var onGroup = callbackDict.onGroup;
    var onAtom = callbackDict.onAtom;
    var onBond = callbackDict.onBond;

    // setup index counters
    var modelIndex = 0;
    var chainIndex = 0;
    var groupIndex = 0;
    var atomIndex = 0;

    // setup optional fields
    var chainNameList = mmtfData.chainNameList;
    var secStructList = mmtfData.secStructList;
    var insCodeList = mmtfData.insCodeList;
    var sequenceIndexList = mmtfData.sequenceIndexList;
    var bFactorList = mmtfData.bFactorList;
    var altLocList = mmtfData.altLocList;
    var occupancyList = mmtfData.occupancyList;
    var bondAtomList = mmtfData.bondAtomList;
    var bondOrderList = mmtfData.bondOrderList;

    // hoisted loop variables
    var i, j, k, kl;

    // loop over all models
    mmtfData.chainsPerModel.forEach( function( modelChainCount ){

        if( onModel ){
            onModel({
                chainCount: modelChainCount,
                modelIndex: modelIndex
            });
        }

        for( i = 0; i < modelChainCount; ++i ){

            var chainGroupCount = mmtfData.groupsPerChain[ chainIndex ];
            if( onChain ){
                var chainId = fromCharCode(
                    mmtfData.chainIdList.subarray( chainIndex * 4, chainIndex * 4 + 4 )
                );
                var chainName = null;
                if( chainNameList ){
                    chainName = fromCharCode(
                        chainNameList.subarray( chainIndex * 4, chainIndex * 4 + 4 )
                    );
                }
                onChain({
                    groupCount: chainGroupCount,
                    chainIndex: chainIndex,
                    modelIndex: modelIndex,
                    chainId: chainId,
                    chainName: chainName
                });
            }

            for( j = 0; j < chainGroupCount; ++j ){

                var groupData = mmtfData.groupList[ mmtfData.groupTypeList[ groupIndex ] ];
                var groupAtomCount = groupData.atomNameList.length;
                if( onGroup ){
                    var secStruct = null;
                    if( secStructList ){
                        secStruct = secStructList[ groupIndex ];
                    }
                    var insCode = null;
                    if( mmtfData.insCodeList ){
                        insCode = String.fromCharCode( insCodeList[ groupIndex ] );
                    }
                    var sequenceIndex = null;
                    if( sequenceIndexList ){
                        sequenceIndex = sequenceIndexList[ groupIndex ];
                    }
                    onGroup({
                        atomCount: groupAtomCount,
                        groupIndex: groupIndex,
                        chainIndex: chainIndex,
                        modelIndex: modelIndex,
                        groupId: mmtfData.groupIdList[ groupIndex ],
                        groupType: mmtfData.groupTypeList[ groupIndex ],
                        groupName: groupData.groupName,
                        singleLetterCode: groupData.singleLetterCode,
                        chemCompType: groupData.chemCompType,
                        secStruct: secStruct,
                        insCode: insCode,
                        sequenceIndex: sequenceIndex
                    });
                }

                if( onBond ){
                    // intra group bonds
                    var bondAtomList = groupData.bondAtomList;
                    for( k = 0, kl = groupData.bondOrderList.length; k < kl; ++k ){
                        onBond({
                            atomIndex1: atomIndex + bondAtomList[ k * 2 ],
                            atomIndex2: atomIndex + bondAtomList[ k * 2 + 1 ],
                            bondOrder: groupData.bondOrderList[ k ]
                        });
                    }
                }

                for( k = 0; k < groupAtomCount; ++k ){

                    if( onAtom ){
                        var bFactor = null;
                        if( bFactorList ){
                            bFactor = bFactorList[ atomIndex ];
                        }
                        var altLoc = null;
                        if( altLocList ){
                            altLoc = String.fromCharCode( altLocList[ atomIndex ] );
                        }
                        var occupancy = null;
                        if( occupancyList ){
                            occupancy = occupancyList[ atomIndex ];
                        }
                        onAtom({
                            atomIndex: atomIndex,
                            groupIndex: groupIndex,
                            chainIndex: chainIndex,
                            modelIndex: modelIndex,
                            atomId: mmtfData.atomIdList[ atomIndex ],
                            element: groupData.elementList[ k ],
                            atomName: groupData.atomNameList[ k ],
                            atomCharge: groupData.atomChargeList[ k ],
                            xCoord: mmtfData.xCoordList[ atomIndex ],
                            yCoord: mmtfData.yCoordList[ atomIndex ],
                            zCoord: mmtfData.zCoordList[ atomIndex ],
                            bFactor: bFactor,
                            altLoc: altLoc,
                            occupancy: occupancy
                        });
                    }

                    atomIndex += 1;
                }

                groupIndex += 1;
            }

            chainIndex += 1;
        }

        modelIndex += 1;
    } );

    if( onBond ){
        // inter group bonds
        if( bondAtomList ){
            for( k = 0, kl = bondAtomList.length; k < kl; k += 2 ){
                onBond({
                    atomIndex1: bondAtomList[ k ],
                    atomIndex2: bondAtomList[ k + 1 ],
                    bondOrder: bondOrderList ? bondOrderList[ k / 2 ] : null
                });
            }
        }
    }

}

export default traverseMmtf;
