
import decodeMsgpack from "./msgpack-decode.js";



function getBuffer( view ){
    var buf = view.buffer;
    var offset = view.byteOffset;
    var length = view.byteLength;
    return buf.slice( offset, offset + length );
}

function getInt8( view, dataArray ){
    if( !dataArray ){
        dataArray = new Int8Array( getBuffer( view ) );
    }else{
        dataArray.set( new Int8Array( getBuffer( view ) ) );
    }
    return dataArray;
}

function getInt16( view, dataArray ){
    var buf = getBuffer( view );
    var dv = new DataView( buf );
    var n = buf.byteLength;
    if( !dataArray ) dataArray = new Int16Array( n / 2 );
    for( var i = 0; i < n; i+=2 ){
        dataArray[ i / 2 ] = dv.getInt16( i, false );
    }
    return dataArray;
}

function getInt32( view, dataArray ){
    var buf = getBuffer( view );
    var dv = new DataView( buf );
    var n = buf.byteLength;
    if( !dataArray ) dataArray = new Int32Array( n / 4 );
    for( var i = 0; i < n; i+=4 ){
        dataArray[ i / 4 ] = dv.getInt32( i, false );
    }
    return dataArray;
}

function decodeFloat( intArray, divisor, dataArray ){
    var n = intArray.length;
    if( !dataArray ) dataArray = new Float32Array( n );
    for( var i = 0; i < n; ++i ){
        dataArray[ i ] = intArray[ i ] / divisor;
    }
    return dataArray;
}

function decodeRunLength( array, dataArray ){
    var i, il;
    if( !dataArray ){
        var fullLength = 0;
        for( i = 0, il = array.length; i < il; i+=2 ){
            fullLength += array[ i + 1 ];
        }
        dataArray = new array.constructor( fullLength );
    }
    var dataOffset = 0;
    for( i = 0, il = array.length; i < il; i+=2 ){
        var value = array[ i ];
        var length = array[ i + 1 ];
        for( var j = 0; j < length; ++j ){
            dataArray[ dataOffset ] = value;
            dataOffset += 1;
        }
    }
    return dataArray;
}

function decodeDelta( dataArray ){
    for( var i = 1, il = dataArray.length; i < il; ++i ){
        dataArray[ i ] += dataArray[ i - 1 ];
    }
    return dataArray;
}

function decodeDeltaMulti( bigArray, smallArray, dataArray ){
    var fullLength = ( bigArray.length / 2 ) + smallArray.length;
    if( !dataArray ) dataArray = new Int32Array( fullLength );
    var dataOffset = 0;
    var smallOffset = 0;
    for( var i = 0, il = bigArray.length; i < il; i+=2 ){
        var value = bigArray[ i ];
        var length = bigArray[ i + 1 ];
        dataArray[ dataOffset ] = value;
        if( i !== 0 ){
            dataArray[ dataOffset ] += dataArray[ dataOffset - 1 ];
        }
        dataOffset += 1;
        for( var j = 0; j < length; ++j ){
            dataArray[ dataOffset ] = dataArray[ dataOffset - 1 ] + smallArray[ smallOffset ];
            dataOffset += 1;
            smallOffset += 1;
        }
    }
    return dataArray;
}

function decodeFloatCombined( bigArray, smallArray, divisor, dataArray ){
    var int32 = decodeDeltaMulti( getInt32( bigArray ), getInt16( smallArray ) );
    return decodeFloat( int32, divisor, dataArray );
}

function getBondCount( msgpack ){
    var resOrder = getInt32( msgpack.resOrder );
    var bondCount = 0;
    for( var i = 0, il = resOrder.length; i < il; ++i ){
        bondCount += msgpack.groupMap[ resOrder[ i ] ].bondOrders.length;
    }
}

//

function decodeData( msgpack, dataStores, params ){

    var p = Object( {}, params );

    var i, il, j, jl, k, kl;

    var bondCount = getBondCount( msgpack );
    var atomCount = msgpack.numAtoms;
    var residueCount = msgpack.resOrder.length / 4;
    var chainCount = msgpack.chainList.length / 4;
    var modelCount = msgpack.chainsPerModel.length;

    var bondStore, atomStore, residueStore, chainStore, modelStore;

    if( dataStores ){
        bondStore = dataStores.bondStore;
        atomStore = dataStores.atomStore;
        residueStore = dataStores.residueStore;
        chainStore = dataStores.chainStore;
        modelStore = dataStores.modelStore;
    }else{
        bondStore = {
            atomIndex1: new Uint32Array( bondCount ),
            atomIndex2: new Uint32Array( bondCount ),
            bondOrder: new Uint8Array( bondCount )
        };
        atomStore = {
            residueIndex: new Uint32Array( atomCount ),
            x: new Float32Array( atomCount ),
            y: new Float32Array( atomCount ),
            z: new Float32Array( atomCount ),
            bfactor: new Float32Array( atomCount ),
            element: new Uint8Array( 3 * atomCount ),
            serial: new Int32Array( atomCount ),
            hetero: new Int8Array( atomCount ),
            altloc: new Uint8Array( atomCount ),
            atomname: new Uint32Array( 4 * atomCount )
        };
        residueStore = {
            chainIndex: new Uint32Array( residueCount ),
            atomOffset: new Uint32Array( residueCount ),
            atomCount: new Uint16Array( residueCount ),
            resno: new Int32Array( residueCount ),
            resname: new Uint8Array( 5 * residueCount ),
            sstruc: new Uint8Array( residueCount )
        };
        chainStore = {
            modelIndex: new Uint16Array( chainCount ),
            residueOffset: new Uint32Array( chainCount ),
            residueCount: new Uint32Array( chainCount ),
            chainname: new Uint8Array( 4 * chainCount )
        };
        modelStore = {
            chainOffset: new Uint32Array( modelCount ),
            chainCount: new Uint32Array( modelCount )
        };
    }

    decodeFloatCombined( msgpack.cartn_x_big, msgpack.cartn_x_small, 1000, atomStore.x );
    decodeFloatCombined( msgpack.cartn_y_big, msgpack.cartn_y_small, 1000, atomStore.y );
    decodeFloatCombined( msgpack.cartn_z_big, msgpack.cartn_z_small, 1000, atomStore.z );
    decodeFloatCombined( msgpack.b_factor_big, msgpack.b_factor_small, 100, atomStore.bfactor );
    decodeDelta( decodeRunLength( getInt32( msgpack._atom_site_id ), atomStore.serial ) );

    for( i = 0, il = msgpack._atom_site_label_alt_id.length; i < il; i+=2 ){
        var value = msgpack._atom_site_label_alt_id[ i ];
        if( value === "?" ){
            msgpack._atom_site_label_alt_id[ i ] = 0;
        }else{
            msgpack._atom_site_label_alt_id[ i ] = msgpack._atom_site_label_alt_id[ i ].charCodeAt( 0 );
        }
        msgpack._atom_site_label_alt_id[ i + 1 ] = parseInt( msgpack._atom_site_label_alt_id[ i + 1 ] );
    }
    decodeRunLength( msgpack._atom_site_label_alt_id, atomStore.altloc );

    //

    chainStore.chainname.set( getInt8( msgpack.chainList ) );

    var chainOffset = 0;
    msgpack.chainsPerModel.forEach( function( chainCount, i ){
        modelStore.chainOffset[ i ] = chainOffset;
        modelStore.chainCount[ i ] = chainCount;
        for( j = 0; j < chainCount; ++j ){
            chainStore.modelIndex[ j + chainOffset ] = i;
        }
        chainOffset += chainCount;
    } );

    var residueOffset = 0;
    msgpack.groupsPerChain.forEach( function( residueCount, i ){
        chainStore.residueOffset[ i ] = residueOffset;
        chainStore.residueCount[ i ] = residueCount;
        for( j = 0; j < residueCount; ++j ){
            residueStore.chainIndex[ j + residueOffset ] = i;
        }
        residueOffset += residueCount;
    } );

    // 

    var sstrucMap = {
        "0": "i",  // pi helix
        "1": "s",  // bend
        "2": "h",  // alpha helix
        "3": "e",  // extended
        "4": "g",  // 3-10 helix
        "5": "b",  // bridge
        "6": "t",  // turn
        "7": "l",  // coil
        "-1": "",  // NA
    };

    decodeDelta( decodeRunLength( getInt32( msgpack._atom_site_auth_seq_id ), residueStore.resno ) );

    var resOrder = getInt32( msgpack.resOrder );
    var secStruct = getInt8( msgpack.secStruct );
    var atomOffset = 0;
    var bondOffset = 0;

    for( i = 0; i < residueCount; ++i ){

        var resData = msgpack.groupMap[ resOrder[ i ] ];
        var hetFlag = resData.hetFlag ? 1 : 0;
        var atomInfo = resData.atomInfo;
        var resAtomCount = atomInfo.length / 2;

        var bondIndices = resData.bondIndices;
        var bondOrders = resData.bondOrders;

        for( j = 0, jl = bondOrders.length; j < jl; ++j ){
            bondStore.atomIndex1[ bondOffset ] = atomOffset + bondIndices[ j * 2 ];
            bondStore.atomIndex2[ bondOffset ] = atomOffset + bondIndices[ j * 2 + 1 ];
            bondStore.bondOrder[ bondOffset ] = bondOrders[ j ];
            bondOffset += 1;
        }

        //

        residueStore.sstruc[ i ] = ( sstrucMap[ secStruct[ i ] ] || "l" ).charCodeAt();
        residueStore.atomOffset[ i ] = atomOffset;
        residueStore.atomCount[ i ] = resAtomCount;

        var resName = resData.resName;
        for( j = 0, jl = resName.length; j < jl; ++j ){
            residueStore.resname[ i * 5 + j ] = resName.charCodeAt( j );
        }

        for( j = 0; j < resAtomCount; ++j ){

            var atomname = atomInfo[ j * 2 + 1 ];
            for( k = 0, kl = atomname.length; k < kl; ++k ){
                atomStore.atomname[ atomOffset * 4 + k ] = atomname.charCodeAt( k );
            }

            var element = atomInfo[ j * 2 ];
            for( k = 0, kl = element.length; k < kl; ++k ){
                atomStore.element[ atomOffset * 3 + k ] = element.charCodeAt( k );
            }

            atomStore.hetero[ atomOffset ] = hetFlag;
            atomStore.residueIndex[ atomOffset ] = i;

            atomOffset += 1;

        }

    }

    return {
        bondStore: bondStore,
        atomStore: atomStore,
        residueStore: residueStore,
        chainStore: chainStore,
        modelStore: modelStore
    };

}

//

var StructureDecoder = function( bin ){

    var self = this;

    if( bin instanceof ArrayBuffer ){
        self.buffer = bin;
        bin = new Uint8Array( bin );
    }else{
        self.buffer = bin.buffer;
    }

    var t0 = performance.now();
    var msgpack = decodeMsgpack( bin );
    var t1 = performance.now();
    this.__msgpackDecodeTimeMs = t1 - t0;

    var bondCount = getBondCount( msgpack );
    var atomCount = msgpack.numAtoms;
    var residueCount = msgpack.resOrder.length / 4;
    var chainCount = msgpack.chainList.length / 4;
    var modelCount = msgpack.chainsPerModel.length;

    function decode( dataStores, params ){
        var t0 = performance.now();
        var d = decodeData( msgpack, dataStores, params );
        var t1 = performance.now();
        self.__structureDecodeTimeMs = t1 - t0;
        self.bondStore = d.bondStore;
        self.atomStore = d.atomStore;
        self.residueStore = d.residueStore;
        self.chainStore = d.chainStore;
        self.modelStore = d.modelStore;
    }

    function getBond( index ){
        return [
            self.bondStore.atomIndex1[ index ],
            self.bondStore.atomIndex2[ index ],
            self.bondStore.bondOrder[ index ]
        ];
    }

    function getAtom( index ){
        var element = "";
        var k, code;
        for( k = 0; k < 3; ++k ){
            code = self.atomStore.element[ 3 * index + k ];
            if( code ){
                element += String.fromCharCode( code );
            }else{
                break;
            }
        }
        var atomname = "";
        for( k = 0; k < 4; ++k ){
            code = self.atomStore.atomname[ 4 * index + k ];
            if( code ){
                atomname += String.fromCharCode( code );
            }else{
                break;
            }
        }
        return [
            self.atomStore.residueIndex[ index ],
            self.atomStore.x[ index ],
            self.atomStore.y[ index ],
            self.atomStore.z[ index ],
            self.atomStore.bfactor[ index ],
            element,
            self.atomStore.serial[ index ],
            self.atomStore.hetero[ index ],
            String.fromCharCode( self.atomStore.altloc[ index ] ),
            atomname
        ];
    }

    function getResidue( index ){
        var resname = "";
        for( var k = 0; k < 5; ++k ){
            var code = self.residueStore.resname[ 5 * index + k ];
            if( code ){
                resname += String.fromCharCode( code );
            }else{
                break;
            }
        }
        return [
            self.residueStore.chainIndex[ index ],
            self.residueStore.atomOffset[ index ],
            self.residueStore.atomCount[ index ],
            self.residueStore.resno[ index ],
            resname,
            String.fromCharCode( self.residueStore.sstruc[ index ] ),
        ];
    }

    function getChain( index ){
        var chainname = "";
        for( var k = 0; k < 4; ++k ){
            var code = self.chainStore.chainname[ 4 * index + k ];
            if( code ){
                chainname += String.fromCharCode( code );
            }else{
                break;
            }
        }
        return [
            self.chainStore.modelIndex[ index ],
            self.chainStore.residueOffset[ index ],
            self.chainStore.residueCount[ index ],
            chainname,
        ];
    }

    function getModel( index ){
        return [
            self.modelStore.chainOffset[ index ],
            self.modelStore.chainCount[ index ]
        ];
    }

    function eachBond( callback ){
        for( var i = 0; i < bondCount; ++i ){
            callback.apply( null, getBond( i ) );
        }
    }

    function eachAtom( callback ){
        for( var i = 0; i < atomCount; ++i ){
            callback.apply( null, getAtom( i ) );
        }
    }

    function eachResidue( callback ){
        for( var i = 0; i < residueCount; ++i ){
            callback.apply( null, getResidue( i ) );
        }
    }
    
    function eachChain( callback ){
        for( var i = 0; i < chainCount; ++i ){
            callback.apply( null, getChain( i ) );
        }
    }
    
    function eachModel( callback ){
        for( var i = 0; i < modelCount; ++i ){
            callback.apply( null, getModel( i ) );
        }
    }

    // API

    this.unitCell = msgpack.unitCell;
    this.spaceGroup = msgpack.spaceGroup;

    this.bondCount = bondCount;
    this.atomCount = atomCount;
    this.residueCount = residueCount;
    this.chainCount = chainCount;
    this.modelCount = modelCount;

    this.bondStore = undefined;
    this.atomStore = undefined;
    this.residueStore = undefined;
    this.chainStore = undefined;
    this.modelStore = undefined;

    this.decode = decode;

    this.getBond = getBond;
    this.getAtom = getAtom;
    this.getResidue = getResidue;
    this.getChain = getChain;
    this.getModel = getModel;

    this.eachBond = eachBond;
    this.eachAtom = eachAtom;
    this.eachResidue = eachResidue;
    this.eachChain = eachChain;
    this.eachModel = eachModel;

};

export default StructureDecoder;
