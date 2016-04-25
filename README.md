
[![Build Status](https://travis-ci.org/rcsb/mmtf-javascript.svg?branch=master)](https://travis-ci.org/rcsb/mmtf-javascript)
[![License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://github.com/rcsb/mmtf-javascript/blob/master/LICENSE)
[![Version](http://img.shields.io/badge/version-0.2.0-blue.svg?style=flat)](https://github.com/rcsb/mmtf-javascript/tree/master)
[![Changelog](https://img.shields.io/badge/changelog--lightgrey.svg?style=flat)](https://github.com/rcsb/mmtf-javascript/blob/master/CHANGELOG.md)


JavaScript decoder for MMTF files. For a description of the format see the [MMTF specification](https://github.com/rcsb/mmtf/blob/master/spec.md). The minified library is available for [download](dist/mmtf.js).


## Table of contents

* [Decoding](#decoding)
* [Traversal](#traversal)


## Decoding

The decoder is exposed as `MMTF.decode` in the library file ([mmtf.js](dist/mmtf.js)) which accepts an `Uint8Array` containing the `mmtf` `msgpack` and returns the decoded `mmtf` data as an object with the following properties.


### Example

```JavaScript
// bin is Uint8Array containing the mmtf msgpack
var mmtfData = MMTF.decode( bin );
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


## Traversal

Helper function to loop over the structural data in the decoded `mmtf` data. Available as `MMTF.traverse` from [mmtf.js](dist/mmtf.js). Runnable example in [mmtf-traversal.html](examples/mmtf-traversal.html).


### Example

```JavaScript
// bin is an Uint8Array containing the mmtf msgpack
var mmtfData = MMTF.decode( bin );
var callbackDict = {
    onModel: function( modelData ){ console.log( modelData ) },
    onChain: function( chainData ){ console.log( chainData ) },
    onGroup: function( groupData ){ console.log( groupData ) },
    onAtom: function( atomData ){ console.log( atomData ) },
    onBond: function( bondData ){ console.log( bondData ) }
};
MMTF.traverse( mmtfData, callbackDict );
```


### Objects

#### bondData

| Name                      | Type           | Description                                    |
|---------------------------|----------------|------------------------------------------------|
| atomIndex1                | `Integer`      | First atom index of the bond                   |
| atomIndex2                | `Integer`      | Second atom index of the bond                  |
| bondOrder                 | `Integer|null` | Order of the bond                              |


#### atomData

| Name                      | Type           | Description                                    |
|---------------------------|----------------|------------------------------------------------|
| element                   | `String`       | Element                                        |
| atomName                  | `String`       | Atom name                                      |
| atomCharge                | `Integer`      | Formal charge                                  |
| xCoord                    | `Float`        | X coordinate                                   |
| yCoord                    | `Float`        | Y coordinate                                   |
| zCoord                    | `Float`        | Z coordinate                                   |
| bFactor                   | `Float|null`   | B-factor                                       |
| atomId                    | `Integer|null` | Atom ID                                        |
| altLoc                    | `Char|null`    | Alternate location label                       |
| occupancy                 | `Float|null`   | Occupancy                                      |
| atomIndex                 | `Integer`      | Index of the atom                              |
| groupIndex                | `Integer`      | Index of the group                             |
| chainIndex                | `Integer`      | Index of the chain                             |
| modelIndex                | `Integer`      | Index of the model                             |


#### groupData

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
| atomCount                 | `Integer`      | Number of atoms in the group                   |
| groupIndex                | `Integer`      | Index of the group                             |
| chainIndex                | `Integer`      | Index of the chain                             |
| modelIndex                | `Integer`      | Index of the model                             |


#### chainData

| Name                      | Type           | Description                                    |
|---------------------------|----------------|------------------------------------------------|
| chainId                   | `String`       | Chain ID                                       |
| chainName                 | `String|null`  | Chain name                                     |
| groupCount                | `Integer`      | Number of groups in the chain                  |
| chainIndex                | `Integer`      | Index of the chain                             |
| modelIndex                | `Integer`      | Index of the model                             |


#### modelData

| Name                      | Type           | Description                                    |
|---------------------------|----------------|------------------------------------------------|
| modelIndex                | `Integer`      | Index of the model                             |
| chainCount                | `Integer`      | Number of chains in the model                  |
