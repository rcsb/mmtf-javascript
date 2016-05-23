
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
        bFactorBig: new Uint8Array( MmtfUtils.makeInt32Buffer( [ 9999, 1 ] ) ),
        bFactorSmall: new Uint8Array( MmtfUtils.makeInt16Buffer( [ 1 ] ) ),
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


function getEmptyFullDecodedMmtfDict(){
    return {
        altLocList: new Uint8Array( 0 ),
        atomIdList: new Int32Array( 0 ),
        bFactorList: new Float32Array( 0 ),
        bioAssemblyList: [],
        bondAtomList: new Int32Array( 0 ),
        bondOrderList: new Uint8Array( 0 ),
        chainIdList: new Uint8Array( 0 ),
        chainNameList: new Uint8Array( 0 ),
        chainsPerModel: [],
        depositionDate: "0000-00-00",
        entityList: [],
        experimentalMethods: [],
        groupIdList: new Int32Array( 0 ),
        groupList: [],
        groupTypeList: new Int32Array( 0 ),
        groupsPerChain: [],
        insCodeList: new Uint8Array( 0 ),
        mmtfProducer: "",
        mmtfVersion: "",
        numAtoms: 0,
        numBonds: 0,
        numChains: 0,
        numGroups: 0,
        numModels: 0,
        occupancyList: new Float32Array( 0 ),
        structureId: "",
        rFree: 0,
        rWork: 0,
        releaseDate: "0000-00-00",
        resolution: 0,
        secStructList: new Int8Array( 0 ),
        sequenceIndexList:  new Int32Array( 0 ),
        spaceGroup: "",
        title: "",
        unitCell: [ 0, 0, 0, 0, 0, 0 ],
        xCoordList: new Float32Array( 0 ),
        yCoordList: new Float32Array( 0 ),
        zCoordList: new Float32Array( 0 )
    };
}

function getEmptyRequiredDecodedMmtfDict(){
    return {
        chainIdList: new Uint8Array( 0 ),
        chainsPerModel: [],
        groupIdList: new Int32Array( 0 ),
        groupList: [],
        groupTypeList: new Int32Array( 0 ),
        groupsPerChain: [],
        mmtfProducer: "",
        mmtfVersion: "",
        numAtoms: 0,
        numBonds: 0,
        numChains: 0,
        numGroups: 0,
        numModels: 0,
        xCoordList: new Float32Array( 0 ),
        yCoordList: new Float32Array( 0 ),
        zCoordList: new Float32Array( 0 )
    };
}

function getFilledFullDecodedMmtfDict(){
    return {
        mmtfVersion: "0.1",
        mmtfProducer: "unittest",

        unitCell: [ 10, 12, 30, 90, 90, 120 ],
        structureId: "1XYZ",
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

        numBonds: 1,
        numAtoms: 2,
        numGroups: 1,
        numChains: 1,
        numModels: 1,
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
        bondAtomList: new Int32Array( [ 0, 1, 0, 0 ] ),
        bondOrderList: new Uint8Array( [ 2, 0 ] ),

        altLocList: new Uint8Array( [ 65, 66 ] ),
        atomIdList: new Int32Array( [ 1, 2 ] ),
        bFactorList: new Float32Array( [ 99.99, 100.00 ] ),
        occupancyList: new Float32Array( [ 0.6, 0.4 ] ),
        xCoordList: new Float32Array( [ 50, 52 ] ),
        yCoordList: new Float32Array( [ 60, 63 ] ),
        zCoordList: new Float32Array( [ 70, 74 ] ),

        groupIdList: new Int32Array( [ 100 ] ),
        groupTypeList: new Int32Array( [ 0 ] ),
        secStructList: new Int8Array( [ -1 ] ),
        insCodeList: new Uint8Array( [ 88 ] ),
        sequenceIndexList: new Int32Array( [ 0 ] ),

        chainIdList: new Uint8Array( [ 68, 65, 0, 0 ] ),
        chainNameList: new Uint8Array( [  66, 0, 0, 0 ] ),
        groupsPerChain: [ 1 ],

        chainsPerModel: [ 1 ],
    };
}

function getFilledRequiredDecodedMmtfDict(){
    return {
        mmtfVersion: "0.1",
        mmtfProducer: "unittest",
        numBonds: 1,
        numAtoms: 2,
        numGroups: 1,
        numChains: 1,
        numModels: 1,
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
        xCoordList: new Float32Array( [ 100, 110 ] ),
        yCoordList: new Float32Array( [ 200, 220 ] ),
        zCoordList: new Float32Array( [ 300, 330 ] ),
        groupIdList: new Int32Array( [ 100 ] ),
        groupTypeList: new Int32Array( [ 0 ] ),
        chainIdList: new Uint8Array( [ 65, 0, 0, 0 ] ),
        groupsPerChain: [ 1 ],

        chainsPerModel: [ 1 ],
    };
}
