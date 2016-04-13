
[![Build Status](https://travis-ci.org/rcsb/mmtf-javascript.svg?branch=master)](https://travis-ci.org/rcsb/mmtf-javascript) [![License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://github.com/rcsb/mmtf-javascript/blob/master/LICENSE)


JavaScript decoder for MMTF files. For a description of the format see the [MMTF specification](https://github.com/rcsb/mmtf/blob/master/spec.md). The minified library is available for [download](dist/mmtf-decode.js).


## Table of contents

* [Decoder](#decoder)
* [Iterator](#Iterator)


## Decoder

The only exposed function of the library file ([mmtf-decode.js](dist/mmtf-decode.js)) is `decodeMmtf` which accepts an `Uint8Array` containing the `mmtf` `msgpack` and returns the decoded `mmtf` data as an object with the following properties.


### Example

```JavaScript
// bin is Uint8Array containing the mmtf msgpack
var mmtfData = decodeMmtf( bin );
console.log( mmtfData.numAtoms );
```


### Properties

| Name                       | Type           | Description                                | Optional |
|----------------------------|----------------|--------------------------------------------|:--------:|
| mmtfVersion                | `String`       | MMTF specification version                 |          |
| mmtfProducer               | `String`       | Program that created the file              |          |
| unitCell                   | `Array`        | Crystallographic unit cell                 |    Y     |
| spaceGroup                 | `String`       | Hermann-Mauguin symbol                     |    Y     |
| structureId                | `String`       | Some reference, e.g. a PDB ID              |    Y     |
| title                      | `String`       | Short description                          |    Y     |
| depositionDate             | `String`       | Deposition date in YYYY-MM-DD format       |    Y     |
| releaseDate                | `String`       | Release date in YYYY-MM-DD format          |    Y     |
| experimentalMethods        | `Array`        | Structure determination methods            |    Y     |
| resolution                 | `Number`       | Resolution in Å                            |    Y     |
| rFree                      | `Number`       | R-free value                               |    Y     |
| rWork                      | `Number`       | R-work value                               |    Y     |
| numBonds                   | `Number`       | Number of bonds                            |          |
| numAtoms                   | `Number`       | Number of atoms                            |          |
| numGroups                  | `Number`       | Number of groups (residues)                |          |
| numChains                  | `Number`       | Number of chains                           |          |
| numModels                  | `Number`       | Number of models                           |          |
| chainsPerModel             | `Array`        | List of number of chains in each model     |          |
| groupsPerChain             | `Array`        | List of number of groups in each chain     |          |
| entityList                 | `Array`        | List of [`entity`](#entity) objects        |    Y     |
| bioAssemblyList            | `Array`        | List of [`assembly`](#assembly) objects    |    Y     |
| groupList                  | `Array`        | List of [`groupType`](#groupType) objects  |    Y     |
| bondAtomList               | `Int32Array`   | List of bonded atom indices                |    Y     |
| bondOrderList              | `Uint8Array`   | List of bond orders                        |    Y     |
| xCoordList                 | `Float32Array` | List of x coordinates in Å                 |          |
| yCoordList                 | `Float32Array` | List of y coordinates in Å                 |          |
| zCoordList                 | `Float32Array` | List of z coordinates in Å                 |          |
| bFactorList                | `Float32Array` | List of B-factors in Å^2                   |    Y     |
| atomIdList                 | `Int32Array`   | List of atom ids                           |    Y     |
| altLocList                 | `Uint8Array`   | List of alternate location labels          |    Y     |
| occupancyList              | `Float32Array` | List of occupancies                        |    Y     |
| groupIdList                | `Int32Array`   | List of group ids                          |          |
| groupTypeList              | `Int32Array`   | List of group types                        |          |
| secStructList              | `Int8Array`    | List of secondary structure codes          |    Y     |
| insCodeList                | `Uint8Array`   | List of insertion codes                    |    Y     |
| seuenceIdList              | `Int32Array`   | List of sequence ids                       |    Y     |
| chainIdList                | `Uint8Array`   | List of chain ids                          |          |
| chainNameList              | `Uint8Array`   | List of chain names                        |    Y     |


### Objects

#### entity

Fields in an `entity` object:

| Name                      | Type         | Description                       |
|---------------------------|--------------|-----------------------------------|
| chainIndexList            | `Array`      | Pointers into chain data fields   |
| description               | `String`     | Description of the entity         |
| type                      | `String`     | Name of the entity type           |
| sequence                  | `String`     | One letter code sequence          |


#### assembly

Fields in an `assembly` object:

| Name                      | Type         | Description                       |
|---------------------------|--------------|-----------------------------------|
| transformList             | `Array`      | List of `transform` objects       |


Fields in a `transform` object:

| Name                      | Type         | Description                       |
|---------------------------|--------------|-----------------------------------|
| chainIndexList            | `Array`      | Pointers into chain data fields   |
| matrix                    | `Array`      | 4x4 transformation matrix         |


#### groupType

Fields of a `groupType` object:

| Name                      | Type         | Description                       |
|---------------------------|--------------|-----------------------------------|
| atomChargeList            | `Array`      | List of atom formal charges       |
| elementList               | `Array`      | List of elements                  |
| atomNameList              | `Array`      | List of atom names                |
| bondAtomList              | `Array`      | List of bonded atom indices       |
| bondOrderList             | `Array`      | List of bond orders               |
| groupName                 | `String`     | The name of the group             |
| singleLetterCode          | `String`     | The single letter code            |
| chemCompType              | `String`     | The chemical component type       |


### Traversal

Runnable example in [mmtf-traversal.html](examples/mmtf-traversal.html).

```JavaScript
// bin is Uint8Array containing the mmtf msgpack
// decode the binary response data
var mmtfData = decodeMmtf( bin );
// loop over all models
var modelIndex = 0;
var chainIndex = 0;
var groupIndex = 0;
var atomIndex = 0;
mmtfData.chainsPerModel.forEach( function( modelChainCount ){
    console.log( "modelIndex", modelIndex );
    for( var i = 0; i < modelChainCount; ++i ){
        console.log( "chainIndex", chainIndex );
        var chainId = fromCharCode(
            mmtfData.chainIdList.subarray( chainIndex * 4, chainIndex * 4 + 4 )
        );
        console.log( "chainId", chainId );
        if( mmtfData.chainNameList ){
            var chainName = fromCharCode(
                mmtfData.chainNameList.subarray( chainIndex * 4, chainIndex * 4 + 4 )
            );
            console.log( "chainName", chainName );
        }
        var chainGroupCount = mmtfData.groupsPerChain[ chainIndex ];
        for( var j = 0; j < chainGroupCount; ++j ){
            console.log( "groupIndex", groupIndex );
            console.log( "groupId", mmtfData.groupIdList[ groupIndex ] );
            console.log( "groupType", mmtfData.groupTypeList[ groupIndex ] );
            var groupType = mmtfData.groupList[ mmtfData.groupTypeList[ groupIndex ] ];
            console.log( "groupName", groupType.groupName );
            if( mmtfData.secStructList ){
                console.log( "secStruct", mmtfData.secStructList[ groupIndex ] );
            }
            if( mmtfData.insCodeList ){
                console.log( "insCode", mmtfData.insCodeList[ groupIndex ] );
            }
            if( mmtfData.sequenceIndexList ){
                console.log( "sequenceIndex", mmtfData.sequenceIndexList[ groupIndex ] );
            }
            var groupAtomCount = groupType.atomNameList.length;
            for( var k = 0; k < groupAtomCount; ++k ){
                console.log( "atomIndex", atomIndex );
                console.log( "atomId", mmtfData.atomIdList[ atomIndex ] );
                console.log( "element", groupType.elementList[ k ] );
                console.log( "atomName", groupType.atomNameList[ k ] );
                console.log( "formalCharge", groupType.atomChargeList[ k ] );
                console.log( "xCoord", mmtfData.xCoordList[ atomIndex ] );
                console.log( "yCoord", mmtfData.yCoordList[ atomIndex ] );
                console.log( "zCoord", mmtfData.zCoordList[ atomIndex ] );
                if( mmtfData.bFactorList ){
                    console.log( "bFactor", mmtfData.bFactorList[ atomIndex ] );
                }
                if( mmtfData.altLocList ){
                    console.log( "altLoc", mmtfData.altLocList[ atomIndex ] );
                }
                if( mmtfData.occupancyList ){
                    console.log( "occupancy", mmtfData.occupancyList[ atomIndex ] );
                }
                atomIndex += 1;
            }
            groupIndex += 1;
        }
        chainIndex += 1;
    }
    modelIndex += 1;
} );
```


## Iterator

Helper class to loop over the structural data in the decoded `mmtf` data. Available in file [mmtf-iterator.js](dist/mmtf-iterator.js). Runnable example in [mmtf-iterator.html](examples/mmtf-iterator.html).


### Example

```JavaScript
// bin is Uint8Array containing the mmtf msgpack
var mmtfData = decodeMmtf( bin );
var mmtfIterator = new MmtfIterator( mmtfData );
mmtfIterator.eachAtom(
    function(
        element, atomName, formalCharge,
        xCoord, yCoord, zCoord, bFactor,
        atomId, altLoc, occupancy
    ){
        console.log(
            element, atomName, formalCharge,
            xCoord, yCoord, zCoord, bFactor,
            atomId, altLoc, occupancy
        );
    }
)
```


### Methods

#### eachBond

*Signature*: `eachBond( callback )`

Arguments passed to `callback`:

| Name                      | Type           | Description                                    |
|---------------------------|----------------|------------------------------------------------|
| atomIndex1                | `Integer`      | First atom index of the bond                   |
| atomIndex2                | `Integer`      | Second atom index of the bond                  |
| bondOrder                 | `Integer|null` | Order of the bond                              |


#### eachAtom

*Signature*: `eachAtom( callback )`

Arguments passed to `callback`:

| Name                      | Type           | Description                                    |
|---------------------------|----------------|------------------------------------------------|
| element                   | `String`       | Element                                        |
| atomName                  | `String`       | Atom name                                      |
| formalCharge              | `Integer`      | Formal charge                                  |
| xCoord                    | `Float`        | X coordinate                                   |
| yCoord                    | `Float`        | Y coordinate                                   |
| zCoord                    | `Float`        | Z coordinate                                   |
| bFactor                   | `Float|null`   | B-factor                                       |
| atomId                    | `Integer|null` | Atom ID                                        |
| altLoc                    | `Char|null`    | Alternate location label                       |
| occupancy                 | `Float|null`   | Occupancy                                      |


#### eachGroup

*Signature*: `eachGroup( callback )`

Arguments passed to `callback`:

| Name                      | Type           | Description                                    |
|---------------------------|----------------|------------------------------------------------|
| groupName                 | `String`       | Group name                                     |
| singleLetterCode          | `Char`         | Group single letter code                       |
| checmCompType             | `Integer`      | Chemical component type                        |
| groupId                   | `Integer`      | Group ID                                       |
| groupType                 | `Integer`      | Group type                                     |
| secStruct                 | `Integer|null` | Secondary structure code                       |
| insCode                   | `Char|null`    | Insertion code                                 |
| sequenceIndex             | `Integer|null` | Sequence index                                 |
| atomOffset                | `Integer`      | Pointer to data of the group's first atom      |
| atomCount                 | `Integer`      | Number of atoms in the group                   |


#### eachChain

*Signature*: `eachChain( callback )`

Arguments passed to `callback`:

| Name                      | Type           | Description                                    |
|---------------------------|----------------|------------------------------------------------|
| chainId                   | `String`       | Chain ID                                       |
| chainName                 | `String|null`  | Chain name                                     |
| groupOffset               | `Integer`      | Pointer to data of the chain's first group     |
| groupCount                | `Integer`      | Number of groups in the chain                  |


#### eachModel

*Signature*: `eachModel( callback )`

Arguments passed to `callback`:

| Name                      | Type           | Description                                    |
|---------------------------|----------------|------------------------------------------------|
| chainOffset               | `Integer`      | Pointer to data of the models's first chain    |
| chainCount                | `Integer`      | Number of chains in the model                  |
