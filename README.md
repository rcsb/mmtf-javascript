
[![Build Status](https://travis-ci.org/rcsb/mmtf-javascript.svg?branch=master)](https://travis-ci.org/rcsb/mmtf-javascript) [![License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://github.com/rcsb/mmtf-javascript/blob/master/LICENSE)


JavaScript decoder for MMTF files For a description of the format see the [MMTF specification](https://github.com/rcsb/mmtf/blob/master/spec.md). The minified library is available for [download](dist/mmtf-decode.js).


## Table of contents

* [API](#api)
* [SimpleStructure](#SimpleStructure)


## API

The only exposed function of the library file ([mmtf-decode.js](dist/mmtf-decode.js)) is `decodeMmtf` which accepts a `Uint8Array` containing the `mmtf` `msgpack` and returns a decoded `mmtf` object with the following properties.


### Header information

- unitCell
- spaceGroup
- bioAssembly
- pdbId
- title
- numBonds
- numAtoms
- numGroups
- numChains
- numModels


### Data maps

- groupMap
	- atomCharges
	- atomInfo
	- bondIndices
	- bondOrders
	- hetFlag
	- groupName


### Data stores

- bondStore
	- atomIndex1
	- atomIndex2
	- bondOrder
- atomStore
	- groupIndex
	- xCoord, yCoord, zCoord
	- bFactor
	- atomId
	- altLabel
	- insCode
	- occupancy
- groupStore
	- chainIndex
	- atomOffset
	- atomCount
	- groupTypeId (points to entry in groupMap)
	- groupNum
	- secStruct
- chainStore
	- modelIndex
	- groupOffset
	- groupCount
	- chainName
- modelStore
	- chainOffset
	- chainCount


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

