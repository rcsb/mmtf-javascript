
//////////////////
// mmtf encoding
//
QUnit.module( "mmtf encoding" );

QUnit.test( "filled required", function( assert ) {
	var inputDict = {
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
    var expected = getFilledRequiredMmtfDict();
    var encodedMmtf = encodeMmtf( inputDict );

    assert.deepEqual( encodedMmtf, expected, "Passed!" );
});
