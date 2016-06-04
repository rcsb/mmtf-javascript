
## Files

The file `dist/mmtf.js` provides the [MMTF](module-MMTF.html) module in [UMD](https://github.com/umdjs/umd) format to work in node.js and browsers. This library version supports *v0.2* of the [MMTF specification](https://github.com/rcsb/mmtf/blob/master/spec.md).


## Fetching

[MMTF.fetch](module-MMTF.html#.fetch) and [MMTF.fetchReduced](module-MMTF.html#.fetchReduced) are helper functions to quickly load and decode PDB IDs in MMTF format.

```JavaScript
// Fetch PDB ID 3PQR in MMTF format and print the decoded MMTF data (or an loading/decoding error)
MMTF.fetch(
	"3PQR",
    // onLoad callback
    function( mmtfData ){ console.log( mmtfData ) },
    // onError callback
    function( error ){ console.error( error ) }
);
```


## Traversal

[MMTF.traverse](module-MMTF.html#.traverse) is a helper function to loop over the structural data in the decoded MMTF data object.

```JavaScript
// `bin` is an Uint8Array containing the MMTF MessagePack
var mmtfData = MMTF.decode( bin );

// create event callback functions
var eventCallbacks = {
    onModel: function( modelData ){ console.log( modelData ) },
    onChain: function( chainData ){ console.log( chainData ) },
    onGroup: function( groupData ){ console.log( groupData ) },
    onAtom: function( atomData ){ console.log( atomData ) },
    onBond: function( bondData ){ console.log( bondData ) }
};

// traverse the structure and listen to the events
MMTF.traverse( mmtfData, eventCallbacks );
```


## Decoding

The decoder is exposed as [MMTF.decode](module-MMTF.html#.decode) which accepts an `Uint8Array` containing the MMTF MessagePack and returns the decoded MMTF data as an object. Note, when using [MMTF.fetch](module-MMTF.html#.fetch) or [MMTF.fetchReduced](module-MMTF.html#.fetchReduced), decoding is not necessary.

```JavaScript
// bin is Uint8Array containing the mmtf msgpack
var mmtfData = MMTF.decode( bin );
console.log( mmtfData.numAtoms );
```
