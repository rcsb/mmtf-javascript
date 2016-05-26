/**
 * @file mmtf-constants
 * @private
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


var PassThroughFields = [
    "mmtfVersion", "mmtfProducer",
    "unitCell", "spaceGroup", "structureId", "title",
    "depositionDate", "releaseDate",
    "experimentalMethods", "resolution", "rFree", "rWork",
    "bioAssemblyList", "entityList", "groupList",
    "numBonds", "numAtoms", "numGroups", "numChains", "numModels",
    "groupsPerChain", "chainsPerModel",
];

var EncodedFields = [
	// required
    "xCoordList", "yCoordList", "zCoordList",
    "groupIdList", "groupTypeList",
    "chainIdList",
    // optional
    "bFactorList", "atomIdList", "altLocList", "occupancyList",
    "secStructList", "insCodeList", "sequenceIndexList",
    "chainNameList",
    "bondAtomList", "bondOrderList"
];

var AllFields = PassThroughFields.concat( EncodedFields );


export {
	PassThroughFields,
	EncodedFields,
    AllFields
};
