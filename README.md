
[![Build Status](https://travis-ci.org/rcsb/mmtf-javascript.svg?branch=master)](https://travis-ci.org/rcsb/mmtf-javascript) [![License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://github.com/rcsb/mmtf-javascript/blob/master/LICENSE)


JavaScript decoder for MMTF files. For a description of the format see the [MMTF specification](https://github.com/rcsb/mmtf/blob/master/spec.md). The minified library is available for [download](dist/mmtf-decode.js).


## Table of contents

* [API](#api)
* [SimpleStructure](#SimpleStructure)


## API

The only exposed function of the library file ([mmtf-decode.js](dist/mmtf-decode.js)) is `decodeMmtf` which accepts an `Uint8Array` containing the `mmtf` `msgpack` and returns a decoded `mmtf` object with the following properties.


### Properties

| Name                       | Type           | Description                                |
|----------------------------|----------------|--------------------------------------------|
| mmtfVersion                | `String`       | MMTF specification version                 |
| mmtfProducer               | `String`       | Program that created the file              |
| unitCell                   | `Array`        | Crystallographic unit cell                 |
| spaceGroup                 | `String`       | Hermann-Mauguin symbol                     |
| pdbId                      | `String`       | Reference to wwPDB entry                   |
| title                      | `String`       | Short description                          |
| experimentalMethods        | `Array`        | Structure determination methods            |
| resolution                 | `Number`       | Resolution in angstrom                     |
| rFree                      | `Number`       | R-free value                               |
| rWork                      | `Number`       | R-work value                               |
| numBonds                   | `Number`       | Number of bonds                            |
| numAtoms                   | `Number`       | Number of atoms                            |
| numGroups                  | `Number`       | Number of groups (residues)                |
| numChains                  | `Number`       | Number of chains                           |
| numModels                  | `Number`       | Number of models                           |
| entityList                 | `Array`        | List of [`entity`](#entity) objects        |
| bioAssemblyList            | `Array`        | List of [`assembly`](#assembly) objects    |
| groupList                  | `Array`        | List of [`groupType`](#groupType) objects  |
| bondAtomList               | `Int32Array`   | List of bonded atom indices                |
| bondOrderList              | `Uint8Array`   | List of bond orders                        |
| xCoordList                 | `Float32Array` | List of x coordinates                      |
| yCoordList                 | `Float32Array` | List of y coordinates                      |
| zCoordList                 | `Float32Array` | List of z coordinates                      |
| bFactorList                | `Float32Array` | List of b-factors                          |
| atomIdList                 | `Int32Array`   | List of atom ids                           |
| altLabelList               | `Uint8Array`   | List of alternate location labels          |
| occupancyList              | `Float32Array` | List of occupancies                        |
| groupIdList                | `Int32Array`   | List of group ids                          |
| groupTypeList              | `Int32Array`   | List of group types                        |
| secStructList              | `Int8Array`    | List of secondary structure codes          |
| insCodeList                | `Uint8Array`   | List of insertion codes                    |
| chainIdList                | `Uint8Array`   | List of chain ids                          |
| chainNameList              | `Uint8Array`   | List of chain names                        |


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
| transforms                | `Array`      | List of `transform` objects       |


Fields in an `transform` object:

| Name                      | Type         | Description                       |
|---------------------------|--------------|-----------------------------------|
| chainIndexList            | `Array`      | Pointers into chain data fields   |
| transformation            | `Array`      | 4x4 transformation matrix         |


#### groupType

Fields of a `groupType` entry:

| Name                      | Type         | Description                       |
|---------------------------|--------------|-----------------------------------|
| atomCharges               | `Array`      | List of atom charges              |
| atomInfo                  | `Array`      | List of atom names and elements   |
| bondIndices               | `Array`      | List of bonded atom indices       |
| bondOrders                | `Array`      | List of bond orders               |
| groupName                 | `String`     | The name of the group             |
| singleLetterCode          | `String`     | The single letter code            |
| chemCompType              | `String`     | The chemical component type       |


## SimpleStructure

Example of how to access the structural data from the decoded `mmtf` object. Available in file [structure.js](examples/structure.js).

```JavaScript
// bin is Uint8Array containing the mmtf msgpack
var mmtfObject = decodeMmtf( bin );
var structure = new SimpleStructure( mmtfObject );
```


### Header fields

- unitCell
- spaceGroup
- bioAssembly
- pdbId
- title


### Entity getters

- getBond( index )
- getAtom( index )
- getGroup( index )
- getChain( index )
- getModel( index )


### Entity iterators

- eachBond( fn )
- eachAtom( fn )
- eachGroup( fn )
- eachChain( fn )
- eachModel( fn )

