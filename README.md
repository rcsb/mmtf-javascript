

JavaScript decoder for MMTF files, see [MMTF specification](https://git.rcsb.org/Research/MMTF-Specification).


## Table of contents

* [API](#api)
* [SimpleStructure](#SimpleStructure)


## API

The only exposed function is `decodeMmtf` which accepts a `Uint8Array` containing the `mmtf` `msgpack` and returns a decoded `mmtf` object with the following properties.


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
- residueStore
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
- getResidue( index )
- getChain( index )
- getModel( index )


### Entity iterators

- eachBond( fn )
- eachAtom( fn )
- eachResidue( fn )
- eachChain( fn )
- eachModel( fn )

