



Table of contents
=================

* [Encodings](#encodings)
* [Fields](#fields)
* [API](#api)



API
===

Header information
------------------

### unitCell

### spaceGroup

### bondCount

### atomCount

### residueCount

### chainCount

### modelCount


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


Data stores
-----------

### bondStore

- atomIndex1
- atomIndex2
- bondOrder


### atomStore

- residueIndex
- x, y, z
- bfactor
- element
- serial
- hetero
- altloc
- atomname


### residueStore

- chainIndex
- atomOffset
- atomCount
- resno
- resname
- sstruc


### chainStore

- modelIndex
- residueOffset
- residueCount
- chainname


### modelStore

- chainOffset
- chainCount



Encodings
=========

Integer encoding
----------------

- Convert floating point numbers to integers by multiplying with a factor and discard everything after the decimal point.
- Depending on the multiplication factor this can change the precision but with a sufficiently large factor it is lossless.
- The Integers can then often be compressed with delta encoding which is the main motivation for it.


Delta encoding
--------------

- For lists of numbers.
- Store differences (deltas) between numbers instead of the numbers themselves.
- When the deltas are smaller than the numbers themselves they require less space.
- Lists that change by an identical amount for a range of consecutive values lend themselves to subsequent run-length encoding.


### Key-value delta encoding

- Special handling of lists with intermittent large delta values (key-values)
- Two arrays are used to store the values
- A unit32 array holds pairs of a large delta value and the number of subsequent small delta values
- A int16 array holds the small values


Run-length encoding
-------------------

- For lists of values that support a equality comparison.
- Represent stretches of equal values by the value itself and the occurrence count.


Dictionary encoding
-------------------

- Create a key-value store and use the key instead of repeating the value over and over again.
- Lists of keys can afterwards be compressed with delta and run-length encoding.



Msgpack fields
==============


### _atom_site_auth_seq_id

- list of residue numbers
- one entry for each residue
- delta and run-length encoded
- decodes into int32 array


### _atom_site_id

- list of atom serial numbers
- one entry for each atom
- delta and run-length encoded
- decodes into int32 array


### _atom_site_label_alt_id

- list of atom alternate location identifier
- one entry for each atom
- run-length encoded
- decodes into uint8 array representing ASCII characters


### _atom_site_label_entity_poly_seq_num

- ??? identical to label_seq_id mmcif field?
- TODO maybe remove
- TODO currently not decoded


### _atom_site_pdbx_PDB_ins_code

- list of atom insertion codes
- one entry for each atom
- run-length encoded
- decodes into a unit8 array representing the insertion code character or null
- TODO currently not decoded


### _atom_site_pdbx_PDB_model_num

- TODO will be removed


### b_factor_big & b_factor_small

- list of atom b-factors
- one entry for each atom
- key-value delta encoded


### bioAssembly

- biological assembly data dumped from biojava
- TODO describe layout


### cartn_x_big & cartn_x_small, cartn_y_big & cartn_y_small, cartn_z_big & cartn_z_small

- list of x, y, and z atom coordinates
- one entry for each atom and coordinate
- key-value delta encoded
- decode into float32 arrays


### chainList

- list of chain names
- uint8 array with four bytes for each chain name


### chainsPerModel

- list of number of chains in each model


### groupMap

- dictionary of per-residue/group data
- TODO describe layout


### groupsPerChain

- list of number of chains in each model


### numAtoms

- integer with the number of atoms


### occupancy

- delta and run-length encoded
- decodes into float32 array
- TODO currently not decoded


### resOrder

- list of pointers to the groupMap dictionary
- one entry for each residue
- currently a int32 array
- TODO can probably be a uint8 array


### secStruct

- list of secondary structure codes
- one entry per residue
- int8 array
- TODO how to handle multi-model structures?


### spaceGroup

- string containing the space group name


### unitCell

- array of six values defining the unit cell
- the first three entries are the length of the sides a, b, and c
- the last three angles are the alpha, beta, and gamma angles


### numBonds

- integer with the number of bonds
- TODO not available yet

