

JavaScript decoder for MMTF files, see [MMTF specification](https://git.rcsb.org/Research/MMTF-Specification).


## Table of contents

* [API](#api)
* [Helper](#helper)



## API

### Header information

#### unitCell

#### spaceGroup

#### bondCount

#### atomCount

#### residueCount

#### chainCount

#### modelCount


### Data maps

#### groupMap

- hetFlag
- atomInfo (element, atomName)


### Data stores

#### bondStore

- atomIndex1
- atomIndex2
- bondOrder


#### atomStore

- residueIndex
- x, y, z
- bfactor
- serial
- altloc


#### residueStore

- chainIndex
- atomOffset
- atomCount
- resno
- groupTypeId (points to entry in groupMap)
- sstruc


#### chainStore

- modelIndex
- residueOffset
- residueCount
- chainname


#### modelStore

- chainOffset
- chainCount



Helper
======

Entity getters
--------------

### getBond

### getAtom

### getResidue

### getChain

### getModel


Entity iterators
----------------

### eachBond

### eachAtom

### eachResidue

### eachChain

### eachModel

