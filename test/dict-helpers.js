

var encBytes = function( type, size, param, bytes ){
    return new Uint8Array( MmtfUtils.encodeBytes.apply( null, arguments ) );
};
var encInt16 = MmtfUtils.encodeInt16;
var encInt32 = MmtfUtils.encodeInt32;


var div100 = MmtfUtils.encodeInt32([ 100 ]);
var div1000 = MmtfUtils.encodeInt32([ 1000 ]);


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
        numGroups: 0,
        numChains: 0,
        numModels: 0,

        // lists
        groupList: [],

        // bonds
        bondAtomList: encBytes( 4, 0, undefined, encInt32([]) ),
        bondOrderList: encBytes( 2, 0, undefined, new Uint8Array([]) ),

        // atoms
        xCoordList: encBytes( 10, 0, encInt32([ 1000 ]), encInt16([]) ),
        yCoordList: encBytes( 10, 0, encInt32([ 1000 ]), encInt16([]) ),
        zCoordList: encBytes( 10, 0, encInt32([ 1000 ]), encInt16([]) ),
        bFactorList: encBytes( 10, 0, encInt32([ 100 ]), encInt16([]) ),
        atomIdList: encBytes( 8, 0, undefined, encInt32([]) ),
        altLocList: encBytes( 6, 0, undefined, new Uint8Array([]) ),
        occupancyList: encBytes( 9, 0, encInt32([ 100 ]), encInt32([]) ),

        // groups
        groupIdList: encBytes( 8, 0, undefined, encInt32([]) ),
        groupTypeList: encBytes( 4, 0, undefined, encInt32([]) ),
        secStructList: encBytes( 2, 0, undefined, new Uint8Array([]) ),
        insCodeList: encBytes( 6, 0, undefined, new Uint8Array([]) ),
        sequenceIndexList: encBytes( 8, 0, undefined, encInt32([]) ),

        // chains
        chainIdList: encBytes( 5, 0, undefined, new Uint8Array([]) ),
        chainNameList: encBytes( 5, 0, undefined, new Uint8Array([]) ),
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
        numGroups: 0,
        numChains: 0,
        numModels: 0,

        // lists
        groupList: [],

        // atoms
        xCoordList: encBytes( 10, 0, encInt32([ 1000 ]), encInt16([]) ),
        yCoordList: encBytes( 10, 0, encInt32([ 1000 ]), encInt16([]) ),
        zCoordList: encBytes( 10, 0, encInt32([ 1000 ]), encInt16([]) ),

        // groups
        groupIdList: encBytes( 8, 0, undefined, encInt32([]) ),
        groupTypeList: encBytes( 4, 0, undefined, encInt32([]) ),

        // chains
        chainIdList: encBytes( 5, 0, undefined, new Uint8Array([]) ),
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
        numGroups: 1,
        numChains: 1,
        numModels: 1,

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
        bondAtomList: encBytes( 4, 4, undefined, encInt32([ 0, 1, 0, 0 ]) ),
        bondOrderList: encBytes( 2, 2, undefined, new Uint8Array( new Int8Array([ 2, 0 ]).buffer ) ),

        // atoms
        xCoordList: encBytes( 10, 2, encInt32([ 1000 ]), encInt16([ 5000, 100 ]) ),
        yCoordList: encBytes( 10, 2, encInt32([ 1000 ]), encInt16([ 6000, 100 ]) ),
        zCoordList: encBytes( 10, 2, encInt32([ 1000 ]), encInt16([ 7000, 100 ]) ),
        bFactorList: encBytes( 10, 2, encInt32([ 100 ]), encInt16([ 9999, 1 ]) ),
        atomIdList: encBytes( 8, 2, undefined, encInt32([ 1, 2 ]) ),
        altLocList: encBytes( 6, 2, undefined, encInt32([ 65, 1, 66, 1 ]) ),
        occupancyList: encBytes( 9, 2, encInt32([ 100 ]), encInt32([ 60, 1, 40, 1 ]) ),

        // groups
        groupIdList: encBytes( 8, 1, undefined, encInt32([ 100, 1 ]) ),
        groupTypeList: encBytes( 4, 1, undefined, encInt32([ 0 ]) ),
        secStructList: encBytes( 2, 1, undefined, new Uint8Array( new Int8Array([ -1 ]).buffer ) ),
        insCodeList: encBytes( 6, 1, undefined, encInt32([ 88, 1 ]) ),
        sequenceIndexList: encBytes( 8, 1, undefined, encInt32([ 0, 1 ]) ),

        // chains
        chainIdList: encBytes( 5, 1, undefined, new Uint8Array([ 68, 65, 0, 0 ]) ),
        chainNameList: encBytes( 5, 1, undefined, new Uint8Array([ 66, 0, 0, 0 ]) ),
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
        numGroups: 1,
        numChains: 1,
        numModels: 1,

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
        xCoordList: encBytes(
            10, 3, encInt32([ 1000 ]), encInt16([ 10000, 1, 2 ])
        ),
        yCoordList: encBytes(
            10, 3, encInt32([ 1000 ]), encInt16([ 20000, 1, 2 ])
        ),
        zCoordList: encBytes(
            10, 3, encInt32([ 1000 ]), encInt16([ 30000, 1, 2 ])
        ),

        // groups
        groupIdList: encBytes( 8, 1, undefined, encInt32([ 100, 1 ]) ),
        groupTypeList: encBytes( 4, 1, undefined, encInt32([ 0 ]) ),

        // chains
        chainIdList: encBytes( 5, 1, undefined, new Uint8Array([ 65, 0, 0, 0 ]) ),
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
        bondOrderList: new Int8Array( 0 ),
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
        bondOrderList: new Int8Array( [ 2, 0 ] ),

        altLocList: new Uint8Array( [ 65, 66 ] ),
        atomIdList: new Int32Array( [ 1, 2 ] ),
        bFactorList: new Float32Array( [ 99.99, 100.00 ] ),
        occupancyList: new Float32Array( [ 0.6, 0.4 ] ),
        xCoordList: new Float32Array( [ 5, 5.1 ] ),
        yCoordList: new Float32Array( [ 6, 6.1 ] ),
        zCoordList: new Float32Array( [ 7, 7.1 ] ),

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
        xCoordList: new Float32Array( [ 10, 10.001, 10.003 ] ),
        yCoordList: new Float32Array( [ 20, 20.001, 20.003 ] ),
        zCoordList: new Float32Array( [ 30, 30.001, 30.003 ] ),
        groupIdList: new Int32Array( [ 100 ] ),
        groupTypeList: new Int32Array( [ 0 ] ),
        chainIdList: new Uint8Array( [ 65, 0, 0, 0 ] ),
        groupsPerChain: [ 1 ],

        chainsPerModel: [ 1 ],
    };
}
