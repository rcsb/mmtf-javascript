/**
 * @file msgpack-encode
 * @private
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * mostly copied from https://github.com/creationix/msgpack-js-browser
 * by Tim Caswell <tim@creationix.com>, MIT License, Copyright (c) 2013
 */

/**
 * msgpack encode module.
 * @module MsgpackEncode
 */

import { utf8Write, utf8ByteCount } from "./utf8-utils.js";

/**
 * encode data value (recursively) into binary encoded MessagePack v5 (http://msgpack.org/)
 * @param  {Object|Array|String|Number|Boolean|null} value  [description]
 * @param  {DataView} view   [description]
 * @param  {Integer} offset [description]
 * @return {Integer} number of bytes written into view
 */
function encode(value, view, offset) {
  var type = typeof value;

  // Strings Bytes
  if (type === "string") {
    var length = utf8ByteCount(value);
    // fix str
    if (length < 0x20) {
      view.setUint8(offset, length | 0xa0);
      utf8Write(view, offset + 1, value);
      return 1 + length;
    }
    // str 8
    if (length < 0x100) {
      view.setUint8(offset, 0xd9);
      view.setUint8(offset + 1, length);
      utf8Write(view, offset + 2, value);
      return 2 + length;
    }
    // str 16
    if (length < 0x10000) {
      view.setUint8(offset, 0xda);
      view.setUint16(offset + 1, length);
      utf8Write(view, offset + 3, value);
      return 3 + length;
    }
    // str 32
    if (length < 0x100000000) {
      view.setUint8(offset, 0xdb);
      view.setUint32(offset + 1, length);
      utf8Write(view, offset + 5, value);
      return 5 + length;
    }
  }

  if (value instanceof ArrayBuffer) {
    var length = value.byteLength;
    // bin 8
    if (length < 0x100) {
      view.setUint8(offset, 0xc4);
      view.setUint8(offset + 1, length);
      (new Uint8Array(view.buffer)).set(new Uint8Array(value), offset + 2);
      return 2 + length;
    }
    // bin 16
    if (length < 0x10000) {
      view.setUint8(offset, 0xc5);
      view.setUint16(offset + 1, length);
      (new Uint8Array(view.buffer)).set(new Uint8Array(value), offset + 3);
      return 3 + length;
    }
    // bin 32
    if (length < 0x100000000) {
      view.setUint8(offset, 0xc6);
      view.setUint32(offset + 1, length);
      (new Uint8Array(view.buffer)).set(new Uint8Array(value), offset + 5);
      return 5 + length;
    }
  }

  if (type === "number") {
    if (!isFinite(value)) {
        throw new Error("Number not finite: " + value);
    }

    // Floating point
    if (Math.floor(value) !== value) {
      view.setUint8(offset, 0xcb);
      view.setFloat64(offset + 1, value);
      return 9;
    }

    // Integers
    if (value >=0) {
      // positive fixnum
      if (value < 0x80) {
        view.setUint8(offset, value);
        return 1;
      }
      // uint 8
      if (value < 0x100) {
        view.setUint8(offset, 0xcc);
        view.setUint8(offset + 1, value);
        return 2;
      }
      // uint 16
      if (value < 0x10000) {
        view.setUint8(offset, 0xcd);
        view.setUint16(offset + 1, value);
        return 3;
      }
      // uint 32
      if (value < 0x100000000) {
        view.setUint8(offset, 0xce);
        view.setUint32(offset + 1, value);
        return 5;
      }
      throw new Error("Number too big 0x" + value.toString(16));
    }
    // negative fixnum
    if (value >= -0x20) {
      view.setInt8(offset, value);
      return 1;
    }
    // int 8
    if (value >= -0x80) {
      view.setUint8(offset, 0xd0);
      view.setInt8(offset + 1, value);
      return 2;
    }
    // int 16
    if (value >= -0x8000) {
      view.setUint8(offset, 0xd1);
      view.setInt16(offset + 1, value);
      return 3;
    }
    // int 32
    if (value >= -0x80000000) {
      view.setUint8(offset, 0xd2);
      view.setInt32(offset + 1, value);
      return 5;
    }
    throw new Error("Number too small -0x" + (-value).toString(16).substr(1));
  }

  // null
  if (value === null) {
    view.setUint8(offset, 0xc0);
    return 1;
  }

  // Boolean
  if (type === "boolean") {
    view.setUint8(offset, value ? 0xc3 : 0xc2);
    return 1;
  }

  // Container Types
  if (type === "object") {
    var length, size = 0;
    var isArray = Array.isArray(value);

    if (isArray) {
      length = value.length;
    }
    else {
      var keys = Object.keys(value);
      length = keys.length;
    }

    var size;
    if (length < 0x10) {
      view.setUint8(offset, length | (isArray ? 0x90 : 0x80));
      size = 1;
    }
    else if (length < 0x10000) {
      view.setUint8(offset, isArray ? 0xdc : 0xde);
      view.setUint16(offset + 1, length);
      size = 3;
    }
    else if (length < 0x100000000) {
      view.setUint8(offset, isArray ? 0xdd : 0xdf);
      view.setUint32(offset + 1, length);
      size = 5;
    }

    if (isArray) {
      for (var i = 0; i < length; i++) {
        size += encode(value[i], view, offset + size);
      }
    }
    else {
      for (var i = 0; i < length; i++) {
        var key = keys[i];
        size += encode(key, view, offset + size);
        size += encode(value[key], view, offset + size);
      }
    }

    return size;
  }
  throw new Error("Unknown type " + type);
}

function encodedSize(value) {
  var type = typeof value;

  // Raw Bytes
  if (type === "string") {
    var length = utf8ByteCount(value);
    if (length < 0x20) {
      return 1 + length;
    }
    if (length < 0x100) {
      return 2 + length;
    }
    if (length < 0x10000) {
      return 3 + length;
    }
    if (length < 0x100000000) {
      return 5 + length;
    }
  }

  if (value instanceof ArrayBuffer) {
    var length = value.byteLength;
    if (length < 0x100) {
      return 2 + length;
    }
    if (length < 0x10000) {
      return 3 + length;
    }
    if (length < 0x100000000) {
      return 5 + length;
    }
  }

  if (type === "number") {
    // Floating Point
    // double
    if (Math.floor(value) !== value) return 9;

    // Integers
    if (value >=0) {
      // positive fixnum
      if (value < 0x80) return 1;
      // uint 8
      if (value < 0x100) return 2;
      // uint 16
      if (value < 0x10000) return 3;
      // uint 32
      if (value < 0x100000000) return 5;
      throw new Error("Number too big 0x" + value.toString(16));
    }
    // negative fixnum
    if (value >= -0x20) return 1;
    // int 8
    if (value >= -0x80) return 2;
    // int 16
    if (value >= -0x8000) return 3;
    // int 32
    if (value >= -0x80000000) return 5;
    throw new Error("Number too small -0x" + value.toString(16).substr(1));
  }

  // Boolean, null
  if (type === "boolean" || value === null) return 1;

  // Container Types
  if (type === "object") {
    var length, size = 0;
    if (Array.isArray(value)) {
      length = value.length;
      for (var i = 0; i < length; i++) {
        size += encodedSize(value[i]);
      }
    }
    else {
      var keys = Object.keys(value);
      length = keys.length;
      for (var i = 0; i < length; i++) {
        var key = keys[i];
        size += encodedSize(key) + encodedSize(value[key]);
      }
    }
    if (length < 0x10) {
      return 1 + size;
    }
    if (length < 0x10000) {
      return 3 + size;
    }
    if (length < 0x100000000) {
      return 5 + size;
    }
    throw new Error("Array or object too long 0x" + length.toString(16));
  }
  throw new Error("Unknown type " + type);
}

function encodeMsgpack(value) {
  var buffer = new ArrayBuffer(encodedSize(value));
  var view = new DataView(buffer);
  encode(value, view, 0);
  return new Uint8Array(buffer);
}

export default encodeMsgpack;
