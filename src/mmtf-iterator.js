/**
 * @file mmtf-iterator
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

/**
 * Helper methods to loop over MMTF data
 * @class
 * @param {Object} mmtfData - decoded mmtf data object
 */
function MmtfIterator( mmtfData ){

    var d = mmtfDict;

    /**
     * Invokes the callback for each bond
     * @param  {Function} callback(arg0, arg1, arg2) - called for each bond
     *  - @param {Integer} arg0 - first atom index of the bond
     *  - @param {Integer} arg1 - second atom index of the bond
     *  - @param {Integer|undefined} arg2 - order of the bond
     */
    function eachBond( callback ){
        var i, il;
        // intra group bonds
        var atomOffset = 0;
        for( i = 0, il = d.numGroups; i < il; ++i ){
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
            for( i = 0, il = d.bondAtomList.length; i < il; i += 2 ){
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
     * @param  {Function} callback(arg0, ..., arg9) - called for each atom
     *  - @param {Float} arg0 - element
     *  - @param {Float} arg1 - atom name
     *  - @param {Float|undefined} arg2 - formal charge
     *  - @param {Float} arg3 - x coordinate
     *  - @param {Float} arg4 - y coordinate
     *  - @param {Float} arg5 - z coordinate
     *  - @param {Float|undefined} arg6 - b-factor
     *  - @param {Integer|undefined} arg7 - atom id
     *  - @param {Char|undefined} arg8 - alternate location label
     *  - @param {Float|undefined} arg9 - occupancy
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
     * @param  {Function} callback(arg0, ..., arg9) - called for each group
     *  - @param {String} arg0 - group name
     *  - @param {Char} arg1 - group single letter code
     *  - @param {String} arg2 - chemical component type
     *  - @param {Integer} arg3 - group id
     *  - @param {Integer} arg4 - group type
     *  - @param {Integer|undefined} arg5 - secondary structure code
     *  - @param {Char|undefined} arg6 - insertion code
     *  - @param {Integer|undefined} arg7 - sequence id
     *  - @param {Integer} arg8 - pointer to data of the group's first atom
     *  - @param {Integer} arg9 - number of atoms in the group
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
     * @param  {Function} callback(arg0, ..., arg3) - called for each chain
     *  - @param {Integer} arg0 - chain id
     *  - @param {Integer|undefined} arg1 - chain name
     *  - @param {Integer} arg2 - pointer to data of the chain's first group
     *  - @param {Integer} arg3 - number of groups in the chain
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
     * @param  {Function} callback(arg0, arg1) - called for each model
     *  - @param {Integer} arg0 - pointer to data of the models's first chain
     *  - @param {Integer} arg1 - number of chains in the model
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

    // API - bind to instance for public access

    this.eachBond = eachBond;
    this.eachAtom = eachAtom;
    this.eachGroup = eachGroup;
    this.eachChain = eachChain;
    this.eachModel = eachModel;

}

export default MmtfIterator;
