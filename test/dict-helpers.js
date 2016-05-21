
function getEmptyFullMmtfDict(){
    return {
        // meta
        mmtfVersion: "",
        mmtfProducer: "",

        // header
        unitCell: [ 0, 0, 0, 0, 0, 0 ],
        spaceGroup: "",
        bioAssemblyList: [],
        structureId: "",
        title: "",
        depositionDate: "0000-00-00",
        releaseDate: "0000-00-00",
        entityList: [],

        experimentalMethods: [],
        resolution: 0,
        rFree: 0,
        rWork: 0,

        // counts
        numBonds: 0,
        numAtoms: 0,

        // lists
        groupList: [],

        // bonds
        bondAtomList: new Uint8Array( 0 ),
        bondOrderList: new Uint8Array( 0 ),

        // atoms
        xCoordBig: new Uint8Array( 0 ),
        xCoordSmall: new Uint8Array( 0 ),
        yCoordBig: new Uint8Array( 0 ),
        yCoordSmall: new Uint8Array( 0 ),
        zCoordBig: new Uint8Array( 0 ),
        zCoordSmall: new Uint8Array( 0 ),
        bFactorBig: new Uint8Array( 0 ),
        bFactorSmall: new Uint8Array( 0 ),
        atomIdList: new Uint8Array( 0 ),
        altLocList: new Uint8Array( 0 ),
        occupancyList: new Uint8Array( 0 ),

        // groups
        groupIdList: new Uint8Array( 0 ),
        groupTypeList: new Uint8Array( 0 ),
        secStructList: new Uint8Array( 0 ),
        insCodeList: new Uint8Array( 0 ),
        sequenceIndexList: new Uint8Array( 0 ),

        // chains
        chainIdList: new Uint8Array( 0 ),
        chainNameList: new Uint8Array( 0 ),
        groupsPerChain: [],

        // models
        chainsPerModel: [],
    };
}

function getEmptyRequiredMmtfDict(){
    return {
        // meta
        mmtfVersion: "",
        mmtfProducer: "",

        // counts
        numBonds: 0,
        numAtoms: 0,

        // lists
        groupList: [],

        // atoms
        xCoordBig: new Uint8Array( 0 ),
        xCoordSmall: new Uint8Array( 0 ),
        yCoordBig: new Uint8Array( 0 ),
        yCoordSmall: new Uint8Array( 0 ),
        zCoordBig: new Uint8Array( 0 ),
        zCoordSmall: new Uint8Array( 0 ),

        // groups
        groupIdList: new Uint8Array( 0 ),
        groupTypeList: new Uint8Array( 0 ),

        // chains
        chainIdList: new Uint8Array( 0 ),
        groupsPerChain: [],

        // models
        chainsPerModel: [],
    };
}

function getFilledFullMmtfDict(){
    return {
        // meta
        mmtfVersion: "0.1",
        mmtfProducer: "unittest",

        // header
        unitCell: [ 10, 12, 30, 90, 90, 120 ],
        spaceGroup: "P1",
        bioAssemblyList: [
            {
                transformList: [
                    {
                        chainIndexList: [ 0 ],
                        matrix: [
                            1, 0, 0, 0,
                            0, 1, 0, 0,
                            0, 0, 1, 0,
                            0, 0, 0, 1
                        ]
                    }
                ]
            },
        ],
        structureId: "1XYZ",
        title: "Full Test",
        depositionDate: "2012-10-20",
        releaseDate: "2012-11-19",
        entityList: [
            {
                chainIndexList: [ 1 ],
                description: "Some Protein",
                sequence: "A",
                type: "polymer"
            }
        ],

        experimentalMethods: [ "X-RAY DIFFRACTION" ],
        resolution: 2.5,
        rFree: 0.7,
        rWork: 0.5,

        // counts
        numBonds: 1,
        numAtoms: 2,

        // lists
        groupList: [
            {
                atomChargeList: [ 2, 1 ],
                elementList: [ "C", "N" ],
                atomNameList: [ "C", "N" ],
                bondAtomList: [ 0, 1 ],
                bondOrderList: [ 2 ],
                chemCompType: "L-PEPTIDE LINKING",
                singleLetterCode: "G",
                groupName: "GLY"
            }
        ],

        // bonds
        bondAtomList: new Uint8Array( MmtfUtils.makeInt32Buffer( [ 0, 1, 0, 0 ] ) ),
        bondOrderList: new Uint8Array( new Uint8Array( [ 2, 0 ] ).buffer ),

        // atoms
        xCoordBig: new Uint8Array( MmtfUtils.makeInt32Buffer( [ 50000, 1 ] ) ),
        xCoordSmall: new Uint8Array( MmtfUtils.makeInt16Buffer( [ 2000 ] ) ),
        yCoordBig: new Uint8Array( MmtfUtils.makeInt32Buffer( [ 60000, 1 ] ) ),
        yCoordSmall: new Uint8Array( MmtfUtils.makeInt16Buffer( [ 3000 ] ) ),
        zCoordBig: new Uint8Array( MmtfUtils.makeInt32Buffer( [ 70000, 1 ] ) ),
        zCoordSmall: new Uint8Array( MmtfUtils.makeInt16Buffer( [ 4000 ] ) ),
        bFactorBig: new Uint8Array( MmtfUtils.makeInt32Buffer( [ 9999, 0, 1, 0 ] ) ),
        bFactorSmall: new Uint8Array( MmtfUtils.makeInt16Buffer( [] ) ),
        atomIdList: new Uint8Array( MmtfUtils.makeInt32Buffer( [ 1, 2 ] ) ),
        altLocList: new Uint8Array( MmtfUtils.makeInt32Buffer( [ 65, 1, 66, 1 ] ) ),
        occupancyList: new Uint8Array( MmtfUtils.makeInt32Buffer( [ 60, 1, 40, 1 ] ) ),

        // groups
        groupIdList: new Uint8Array( MmtfUtils.makeInt32Buffer( [ 100, 1 ] ) ),
        groupTypeList: new Uint8Array( MmtfUtils.makeInt32Buffer( [ 0 ] ) ),
        secStructList: new Uint8Array( new Int8Array( [ -1 ] ).buffer ),
        insCodeList: new Uint8Array( MmtfUtils.makeInt32Buffer( [ 88, 1 ] ) ),
        sequenceIndexList: new Uint8Array( MmtfUtils.makeInt32Buffer( [ 0, 1 ] ) ),

        // chains
        chainIdList: new Uint8Array( [ 68, 65, 0, 0 ] ),
        chainNameList: new Uint8Array( [ 66, 0, 0, 0 ] ),
        groupsPerChain: [ 1 ],

        // models
        chainsPerModel: [ 1 ],
    };
}

function getFilledRequiredMmtfDict(){
    return {
        // meta
        mmtfVersion: "0.1",
        mmtfProducer: "unittest",

        // counts
        numBonds: 1,
        numAtoms: 2,

        // lists
        groupList: [
            {
                atomChargeList: [ 1, 0 ],
                elementList: [ "C", "N" ],
                atomNameList: [ "C", "N" ],
                bondAtomList: [ 0, 1 ],
                bondOrderList: [ 2 ],
                chemCompType: "L-PEPTIDE LINKING",
                singleLetterCode: "G",
                groupName: "GLY"
            }
        ],

        // atoms
        xCoordBig: new Uint8Array( MmtfUtils.makeInt32Buffer( [ 100000, 1 ] ) ),
        xCoordSmall: new Uint8Array( MmtfUtils.makeInt16Buffer( [ 10000 ] ) ),
        yCoordBig: new Uint8Array( MmtfUtils.makeInt32Buffer( [ 200000, 1 ] ) ),
        yCoordSmall: new Uint8Array( MmtfUtils.makeInt16Buffer( [ 20000 ] ) ),
        zCoordBig: new Uint8Array( MmtfUtils.makeInt32Buffer( [ 300000, 1 ] ) ),
        zCoordSmall: new Uint8Array( MmtfUtils.makeInt16Buffer( [ 30000 ] ) ),

        // groups
        groupIdList: new Uint8Array( MmtfUtils.makeInt32Buffer( [ 100, 1 ] ) ),
        groupTypeList: new Uint8Array( MmtfUtils.makeInt32Buffer( [ 0 ] ) ),

        // chains
        chainIdList: new Uint8Array( [ 65, 0, 0, 0 ] ),
        groupsPerChain: [ 1 ],

        // models
        chainsPerModel: [ 1 ],
    };
}

function getMultiModelMmtfDict(){
    return {
        // meta
        mmtfVersion: "0.1",
        mmtfProducer: "unittest",

        // counts
        numBonds: 4,
        numAtoms: 4,

        // lists
        groupList: [
            {
                atomChargeList: [ 1, 0 ],
                elementList: [ "C", "N" ],
                atomNameList: [ "C", "N" ],
                bondAtomList: [ 0, 1 ],
                bondOrderList: [ 2 ],
                chemCompType: "L-PEPTIDE LINKING",
                singleLetterCode: "G",
                groupName: "GLY"
            }
        ],

        // bonds
        bondAtomList: new Uint8Array( MmtfUtils.makeInt32Buffer( [ 1, 0, 3, 2 ] ) ),
        bondOrderList: new Uint8Array( new Uint8Array( [ 1, 1 ] ).buffer ),

        // atoms
        xCoordBig: new Uint8Array( MmtfUtils.makeInt32Buffer( [ 10000, 1, 40000, 1 ] ) ),
        xCoordSmall: new Uint8Array( MmtfUtils.makeInt16Buffer( [ 1000, 1000 ] ) ),
        yCoordBig: new Uint8Array( MmtfUtils.makeInt32Buffer( [ 20000, 1, 50000, 1 ] ) ),
        yCoordSmall: new Uint8Array( MmtfUtils.makeInt16Buffer( [ 2000, 2000 ] ) ),
        zCoordBig: new Uint8Array( MmtfUtils.makeInt32Buffer( [ 30000, 1, 60000, 1 ] ) ),
        zCoordSmall: new Uint8Array( MmtfUtils.makeInt16Buffer( [ 3000, 3000 ] ) ),

        // groups
        groupIdList: new Uint8Array( MmtfUtils.makeInt32Buffer( [ 100, 1, 1, 1 ] ) ),
        groupTypeList: new Uint8Array( MmtfUtils.makeInt32Buffer( [ 0, 0 ] ) ),

        // chains
        chainIdList: new Uint8Array( [ 65, 0, 0, 0, 66, 0, 0, 0 ] ),
        groupsPerChain: [ 1, 1 ],

        // models
        chainsPerModel: [ 1, 1 ],
    };
}
