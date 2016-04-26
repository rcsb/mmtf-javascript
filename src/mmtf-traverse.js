/**
 * @file mmtf-traverse
 * @private
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

/**
 * mmtf traverse module.
 * @module MmtfTraverse
 */

/**
 * Converts an array of ASCII codes trimming '\0' bytes
 * @private
 * @param  {Array} charCodeArray - array of ASCII char codes
 * @return {String} '\0' trimmed string
 */
function fromCharCode( charCodeArray ){
    return String.fromCharCode.apply( null, charCodeArray ).replace(/\0/g, '');
}


/**
 * @callback module:MmtfTraverse.onModel
 * @param {Object} modelData
 * @param {Integer} modelData.chainCount
 * @param {Integer} modelData.modelIndex
 */

/**
 * @callback module:MmtfTraverse.onChain
 * @param {Object} chainData
 * @param {Integer} chainData.groupCount
 * @param {Integer} chainData.chainIndex
 * @param {Integer} chainData.modelIndex
 * @param {String} chainData.chainId
 * @param {?String} chainData.chainName
 */

/**
 * @callback module:MmtfTraverse.onGroup
 * @param {Object} groupData
 * @param {Integer} groupData.atomCount
 * @param {Integer} groupData.groupIndex
 * @param {Integer} groupData.chainIndex
 * @param {Integer} groupData.modelIndex
 * @param {Integer} groupData.groupId
 * @param {Integer} groupData.groupType
 * @param {String} groupData.groupName
 * @param {Char} groupData.singleLetterCode
 * @param {String} groupData.chemCompType
 * @param {?Integer} groupData.secStruct
 * @param {?Char} groupData.insCode
 * @param {?Integer} groupData.sequenceIndex
 */

/**
 * @callback module:MmtfTraverse.onAtom
 * @param {Object} atomData
 * @param {Integer} atomData.atomIndex
 * @param {Integer} atomData.groupIndex
 * @param {Integer} atomData.chainIndex
 * @param {Integer} atomData.modelIndex
 * @param {Integer} atomData.atomId
 * @param {String} atomData.element
 * @param {String} atomData.atomName
 * @param {Integer} atomData.atomCharge
 * @param {Float} atomData.xCoord
 * @param {Float} atomData.yCoord
 * @param {Float} atomData.zCoord
 * @param {?Float} atomData.bFactor
 * @param {?Char} atomData.altLoc
 * @param {?Float} atomData.occupancy
 */

/**
 * @callback module:MmtfTraverse.onBond
 * @param {Object} bondData
 * @param {Integer} bondData.atomIndex1
 * @param {Integer} bondData.atomIndex2
 * @param {Integer} bondData.bondOrder
 */


/**
 * Traverse the MMTF structure data.
 * @static
 * @param {module:MmtfDecode.MmtfData} mmtfData - decoded mmtf data
 * @param {Object} eventCallbacks
 * @param {module:MmtfTraverse.onModel} eventCallbacks.onModel - called for each model
 * @param {module:MmtfTraverse.onChain} eventCallbacks.onChain - called for each chain
 * @param {module:MmtfTraverse.onGroup} eventCallbacks.onGroup - called for each group
 * @param {module:MmtfTraverse.onAtom} eventCallbacks.onAtom - called for each atom
 * @param {module:MmtfTraverse.onBond} eventCallbacks.onBond - called for each bond
 */
function traverseMmtf( mmtfData, eventCallbacks ){

    // setup callbacks
    var onModel = eventCallbacks.onModel;
    var onChain = eventCallbacks.onChain;
    var onGroup = eventCallbacks.onGroup;
    var onAtom = eventCallbacks.onAtom;
    var onBond = eventCallbacks.onBond;

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

    // setup event stop flags
    var stopModelEvent = false;
    var stopChainEvent = false;
    var stopGroupEvent = false;
    var stopAtomEvent = false;

    // hoisted loop variables
    var i, j, k, kl;

    // loop over all models
    mmtfData.chainsPerModel.forEach( function( modelChainCount ){

        if( onModel && !stopModelEvent ){
            stopModelEvent = false === onModel({
                chainCount: modelChainCount,
                modelIndex: modelIndex
            });
        }

        for( i = 0; i < modelChainCount; ++i ){

            var chainGroupCount = mmtfData.groupsPerChain[ chainIndex ];
            if( onChain && !stopChainEvent && !stopModelEvent ){
                var chainId = fromCharCode(
                    mmtfData.chainIdList.subarray( chainIndex * 4, chainIndex * 4 + 4 )
                );
                var chainName = null;
                if( chainNameList ){
                    chainName = fromCharCode(
                        chainNameList.subarray( chainIndex * 4, chainIndex * 4 + 4 )
                    );
                }
                stopChainEvent = false === onChain({
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
                if( onGroup && !stopGroupEvent && !stopChainEvent && !stopModelEvent ){
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
                    stopGroupEvent = false === onGroup({
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

                for( k = 0; k < groupAtomCount; ++k ){

                    if( onAtom && !stopAtomEvent && !stopGroupEvent && !stopChainEvent && !stopModelEvent ){
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
                        stopAtomEvent = false === onAtom({
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

                if( onBond && !stopGroupEvent && !stopChainEvent && !stopModelEvent ){
                    // intra group bonds
                    var bondAtomList = groupData.bondAtomList;
                    for( k = 0, kl = groupData.bondOrderList.length; k < kl; ++k ){
                        onBond({
                            atomIndex1: atomIndex - groupAtomCount + bondAtomList[ k * 2 ],
                            atomIndex2: atomIndex - groupAtomCount + bondAtomList[ k * 2 + 1 ],
                            bondOrder: groupData.bondOrderList[ k ]
                        });
                    }
                }

                stopAtomEvent = false;
                groupIndex += 1;
            }

            stopGroupEvent = false;
            chainIndex += 1;
        }

        stopChainEvent = false;
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
