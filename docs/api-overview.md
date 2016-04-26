
## Files

The file `dist/mmtf.js` provides the [MMTF](module-MMTF.html) module in [UMD](https://github.com/umdjs/umd) format to work in node.js and browsers.


## Decoding

The decoder is exposed as [MMTF.decode](module-MMTF.html#.decode) which accepts an `Uint8Array` containing the MMTF MessagePack and returns the decoded MMTF data as an object.

```JavaScript
// bin is Uint8Array containing the mmtf msgpack
var mmtfData = MMTF.decode( bin );
console.log( mmtfData.numAtoms );
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

// traverse the structure and lsiten to the events
MMTF.traverse( mmtfData, eventCallbacks );
```
