
function SimpleStructure( mmtfDict ){

    var d = mmtfDict;

    /**
     * Invokes the callback for each bond
     * @param  {Function} callback - called for each bond
     *  - @param {Integer} callback.atomIndex1 - first atom index of the bond
     *  - @param {Integer} callback.atomIndex2 - second atom index of the bond
     *  - @param {Integer|undefined} callback.bondOrder - order of the bond
     */
    function eachBond( callback ){
        // intra group bonds
        var atomOffset = 0;
        for( var i = 0, il = d.numGroups; i < il; ++i ){
            var groupData = d.groupList[ d.groupTypeList[ i ] ];
            for( var j = 0, jl = bondOrders.length; j < jl; ++j ){
                callback(
                    atomOffset + groupData.bondIndices[ j * 2 ],
                    atomOffset + groupData.bondIndices[ j * 2 + 1 ],
                    groupData.bondOrders[ j ]
                );
            }
            atomOffset += groupData.atomInfo.length / 2;
        }
        // inter group bonds
        if( d.bondAtomList ){
            for( var i = 0, il = d.bondAtomList.length; i < il; i += 2 ){
                callback(
                    d.bondAtomList[ i ],
                    d.bondAtomList[ i + 1 ],
                    d.bondOrderList ? d.bondOrderList[ i / 2 ] : undefined
                );
            }
        }
    }

    /**
     * Invokes the callback for each atom
     * @param  {Function} callback - called for each atom
     *  - @param {Float} callback.element - element
     *  - @param {Float} callback.atomName - atom name
     *  - @param {Float|undefined} callback.charge - formal charge
     *  - @param {Float} callback.xCoord - x coordinate
     *  - @param {Float} callback.yCoord - y coordinate
     *  - @param {Float} callback.zCoord - z coordinate
     *  - @param {Float|undefined} callback.bFactor - b-factor
     *  - @param {Integer|undefined} callback.atomId - atom id
     *  - @param {Char|undefined} callback.altLabel - alternate location label
     *  - @param {Float|undefined} callback.occupancy - occupancy
     */
    function eachAtom( callback ){
        var atomOffset = 0;
        for( var i = 0, il = d.numGroups; i < il; ++i ){
            var groupData = d.groupList[ d.groupTypeList[ i ] ];
            for( var j = 0, jl = groupData.atomInfo.length / 2; j < jl; ++j ){
                callback(
                    groupData.atomInfo[ j * 2 ].toUpperCase(),
                    groupData.atomInfo[ j * 2 + 1 ],
                    groupData.atomCharges[ j ],
                    d.xCoordList[ atomOffset ],
                    d.yCoordList[ atomOffset ],
                    d.zCoordList[ atomOffset ],
                    d.bFactorList ? d.bFactorList[ atomOffset ] : undefined,
                    d.atomIdList ? d.atomIdList[ atomOffset ] : undefined,
                    d.altLabelList ? d.altLabelList[ atomOffset ] : undefined,
                    d.occupancyList ? d.occupancyList[ atomOffset ] : undefined
                );
                atomOffset += 1;
            }
        }
    }

    /**
     * Invokes the callback for each group
     * @param  {Function} callback - called for each group
     *  - @param {String} callback.groupName - group name
     *  - @param {Char} callback.singleLetterCode - group single letter code
     *  - @param {String} callback.chemCompType - chemical component type
     *  - @param {Integer} callback.groupId - group id
     *  - @param {Integer} callback.groupType - group type
     *  - @param {Integer|undefined} callback.secStruct - secondary structure code
     *  - @param {Char|undefined} callback.insCode - insertion code
     *  - @param {Integer} callback.atomOffset - pointer to data of the group's first atom
     *  - @param {Integer} callback.atomCount - number of atoms in the group
     */
    function eachGroup( callback ){
        var atomOffset = 0;
        for( var i = 0, il = d.numGroups; i < il; ++i ){
            var groupData = d.groupList[ d.groupTypeList[ i ] ];
            var groupAtomCount = groupData.atomInfo.length / 2;
            gAtomOffset[ i ] = atomOffset;
            gAtomCount[ i ] = groupAtomCount;
            callback(
                groupData.groupName,
                groupData.singleLetterCode,
                groupData.chemCompType,
                d.groupIdList[ i ],
                d.groupTypeList[ i ],
                d.secStructList ? d.secStructList[ i ] : undefined,
                d.insCodeList ? d.insCodeList[ i ] : undefined,
                d.sequenceIdList ? d.sequenceIdList[ i ] : undefined,
                atomOffset,
                groupAtomCount
            );
            atomOffset += groupAtomCount;
        }
    }

    /**
     * Invokes the callback for each chain
     * @param  {Function} callback - called for each chain
     *  - @param {Integer} callback.chainId - chain id
     *  - @param {Integer|undefined} callback.chainName - chain name
     *  - @param {Integer} callback.groupOffset - pointer to data of the chain's first group
     *  - @param {Integer} callback.groupCount - number of groups in the chain
     */
    function eachChain( callback ){
        var groupOffset = 0;
        for( var i = 0; i < d.numChains; ++i ){
            var chainGroupCount = d.groupsPerChain[ i ];
            callback(
                d.chainIdList[ i ],
                d.chainNameList ? d.chainNameList[ i ] : undefined,
                groupOffset,
                chainGroupCount
            );
            groupOffset += chainGroupCount;
        }
    }

    /**
     * Invokes the callback for each model
     * @param  {Function} callback - called for each model
     *  - @param {Integer} callback.chainOffset - pointer to data of the models's first chain
     *  - @param {Integer} callback.chainCount - number of chains in the model
     */
    function eachModel( callback ){
        var chainOffset = 0;
        for( var i = 0; i < d.numModels; ++i ){
            var modelChainCount = d.chainsPerModel[ i ];
            callback(
                chainOffset,
                modelChainCount
            );
            chainOffset += modelChainCount;
        }
    }

    // API

    this.eachBond = eachBond;
    this.eachAtom = eachAtom;
    this.eachGroup = eachGroup;
    this.eachChain = eachChain;
    this.eachModel = eachModel;

}
