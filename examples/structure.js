
function SimpleStructure( mmtfData ){

    var d = mmtfData;

    function getBond( index ){
        return [
            d.bondStore.atomIndex1[ index ],
            d.bondStore.atomIndex2[ index ],
            d.bondStore.bondOrder[ index ]
        ];
    }

    function getAtom( index ){
        var groupIndex = d.atomStore.groupIndex[ index ];
        var group = d.groupMap[ d.groupStore.groupTypeId[ groupIndex ] ];
        var groupAtomOffset = d.groupStore.atomOffset[ groupIndex ];
        var groupAtomIndex = index - groupAtomOffset;
        return [
            groupIndex,
            d.atomStore.xCoord[ index ],
            d.atomStore.yCoord[ index ],
            d.atomStore.zCoord[ index ],
            d.atomStore.bFactor ? d.atomStore.bFactor[ index ] : null,
            group.atomInfo[ groupAtomIndex * 2 ],
            d.atomStore.atomId ? d.atomStore.atomId[ index ] : null,
            group.chemCompType,
            d.atomStore.altLabel ? String.fromCharCode( d.atomStore.altLabel[ index ] ) : null,
            group.atomInfo[ groupAtomIndex * 2 + 1 ],
            d.atomStore.insCode ? String.fromCharCode( d.atomStore.insCode[ index ] ) : null,
            d.atomStore.occupancy ? d.atomStore.occupancy[ index ] : null,
            group.singleLetterCode
        ];
    }

    function getGroup( index ){
        var group = d.groupMap[ d.groupStore.groupTypeId[ index ] ];
        var sstrucCode = d.groupStore.secStruct[ index ];
        return [
            d.groupStore.chainIndex[ index ],
            d.groupStore.atomOffset[ index ],
            d.groupStore.atomCount[ index ],
            d.groupStore.groupId[ index ],
            group.groupName,
            sstrucMap[ sstrucCode ]
        ];
    }

    function getChain( index ){
        var chainId = "";
        for( var k = 0; k < 4; ++k ){
            var code = d.chainStore.chainId[ 4 * index + k ];
            if( code ){
                chainId += String.fromCharCode( code );
            }else{
                break;
            }
        }
        return [
            d.chainStore.modelIndex[ index ],
            d.chainStore.groupOffset[ index ],
            d.chainStore.groupCount[ index ],
            chainId
        ];
    }

    function getModel( index ){
        return [
            d.modelStore.chainOffset[ index ],
            d.modelStore.chainCount[ index ]
        ];
    }

    function eachBond( callback ){
        for( var i = 0; i < d.numBonds; ++i ){
            callback.apply( null, getBond( i ) );
        }
    }

    function eachAtom( callback ){
        for( var i = 0; i < d.numAtoms; ++i ){
            callback.apply( null, getAtom( i ) );
        }
    }

    function eachGroup( callback ){
        for( var i = 0; i < d.numGroups; ++i ){
            callback.apply( null, getGroup( i ) );
        }
    }

    function eachChain( callback ){
        for( var i = 0; i < d.numChains; ++i ){
            callback.apply( null, getChain( i ) );
        }
    }

    function eachModel( callback ){
        for( var i = 0; i < d.numModels; ++i ){
            callback.apply( null, getModel( i ) );
        }
    }

    var sstrucMap = {
        "0": "i",  // pi helix
        "1": "s",  // bend
        "2": "h",  // alpha helix
        "3": "e",  // extended
        "4": "g",  // 3-10 helix
        "5": "b",  // bridge
        "6": "t",  // turn
        "7": "l",  // coil
        "-1": ""   // NA
    };

    // API

    this.unitCell = d.unitCell;
    this.spaceGroup = d.spaceGroup;
    this.bioAssembly = d.bioAssembly;
    this.pdbId = d.pdbId;
    this.title = d.title;

    this.numBonds = d.numBonds;
    this.numAtoms = d.numAtoms;
    this.numGroups = d.numGroups;
    this.numChains = d.numChains;
    this.numModels = d.numModels;

    this.bondStore = d.bondStore;
    this.atomStore = d.atomStore;
    this.groupStore = d.groupStore;
    this.chainStore = d.chainStore;
    this.modelStore = d.modelStore;

    this.groupMap = d.groupMap;

    this.getBond = getBond;
    this.getAtom = getAtom;
    this.getGroup = getGroup;
    this.getChain = getChain;
    this.getModel = getModel;

    this.eachBond = eachBond;
    this.eachAtom = eachAtom;
    this.eachGroup = eachGroup;
    this.eachChain = eachChain;
    this.eachModel = eachModel;

}
