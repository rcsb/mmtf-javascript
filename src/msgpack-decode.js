
// TODO license and attribution


function Decoder(buffer, offset) {
  offset = offset || 0;
  var dataView = new DataView(buffer.buffer);

  function map(length) {
    var value = {};
    for (var i = 0; i < length; i++) {
      var key = parse();
      value[key] = parse();
    }
    return value;
  }

  function bin(length) {
    var value = buffer.subarray(offset, offset + length);
    offset += length;
    return value;
  }

  function str(length) {
    var subarray = buffer.subarray(offset, offset + length);
    var value = String.fromCharCode.apply(null, subarray);
    offset += length;
    return value;
  }

  function array(length) {
    var value = new Array(length);
    for (var i = 0; i < length; i++) {
      value[i] = parse();
    }
    return value;
  }

  function parse() {
    var type = buffer[offset];
    var value, length, extType;
    // Positive FixInt
    if ((type & 0x80) === 0x00) {
      offset++;
      return type;
    }
    // FixMap
    if ((type & 0xf0) === 0x80) {
      length = type & 0x0f;
      offset++;
      return map(length);
    }
    // FixArray
    if ((type & 0xf0) === 0x90) {
      length = type & 0x0f;
      offset++;
      return array(length);
    }
    // FixStr
    if ((type & 0xe0) === 0xa0) {
      length = type & 0x1f;
      offset++;
      return str(length);
    }
    // Negative FixInt
    if ((type & 0xe0) === 0xe0) {
      value = dataView.getInt8(offset);
      offset++;
      return value;
    }
    switch (type) {
    // nil
    case 0xc0:
      offset++;
      return null;
    // 0xc1: (never used)
    // false
    case 0xc2:
      offset++;
      return false;
    // true
    case 0xc3:
      offset++;
      return true;
    // bin 8
    case 0xc4:
      length = dataView.getUint8(offset + 1);
      offset += 2;
      return bin(length);
    // bin 16
    case 0xc5:
      length = dataView.getUint16(offset + 1);
      offset += 3;
      return bin(length);
    // bin 32
    case 0xc6:
      length = dataView.getUint32(offset + 1);
      offset += 5;
      return bin(length);
    // ext 8
    case 0xc7:
      length = dataView.getUint8(offset + 1);
      extType = dataView.getUint8(offset + 2);
      offset += 3;
      return [extType, bin(length)];
    // ext 16
    case 0xc8:
      length = dataView.getUint16(offset + 1);
      extType = dataView.getUint8(offset + 3);
      offset += 4;
      return [extType, bin(length)];
    // ext 32
    case 0xc9:
      length = dataView.getUint32(offset + 1);
      extType = dataView.getUint8(offset + 5);
      offset += 6;
      return [extType, bin(length)];
    // float 32
    case 0xca:
      value = dataView.getFloat32(offset + 1);
      offset += 5;
      return value;
    // float 64
    case 0xcb:
      value = dataView.getFloat64(offset + 1);
      offset += 9;
      return value;
    // uint8
    case 0xcc:
      value = buffer[offset + 1];
      offset += 2;
      return value;
    // uint 16
    case 0xcd:
      value = dataView.getUint16(offset + 1);
      offset += 3;
      return value;
    // uint 32
    case 0xce:
      value = dataView.getUint32(offset + 1);
      offset += 5;
      return value;
    // uint64
    case 0xcf:
      value = dataView.getUint64(offset + 1);
      offset += 9;
      return value;
    // int 8
    case 0xd0:
      value = dataView.getInt8(offset + 1);
      offset += 2;
      return value;
    // int 16
    case 0xd1:
      value = dataView.getInt16(offset + 1);
      offset += 3;
      return value;
    // int 32
    case 0xd2:
      value = dataView.getInt32(offset + 1);
      offset += 5;
      return value;
    // int 64
    case 0xd3:
      value = dataView.getInt64(offset + 1);
      offset += 9;
      return value;

    // fixext 1 / undefined
    case 0xd4:
      extType = dataView.getUint8(offset + 1);
      value = dataView.getUint8(offset + 2);
      offset += 3;
      return (extType === 0 && value === 0) ? undefined : [extType, value];
    // fixext 2
    case 0xd5:
      extType = dataView.getUint8(offset + 1);
      offset += 2;
      return [extType, bin(2)];
    // fixext 4
    case 0xd6:
      extType = dataView.getUint8(offset + 1);
      offset += 2;
      return [extType, bin(4)];
    // fixext 8
    case 0xd7:
      extType = dataView.getUint8(offset + 1);
      offset += 2;
      return [extType, bin(8)];
    // fixext 16
    case 0xd8:
      extType = dataView.getUint8(offset + 1);
      offset += 2;
      return [extType, bin(16)];
    // str 8
    case 0xd9:
      length = dataView.getUint8(offset + 1);
      offset += 2;
      return str(length);
    // str 16
    case 0xda:
      length = dataView.getUint16(offset + 1);
      offset += 3;
      return str(length);
    // str 32
    case 0xdb:
      length = dataView.getUint32(offset + 1);
      offset += 5;
      return str(length);
    // array 16
    case 0xdc:
      length = dataView.getUint16(offset + 1);
      offset += 3;
      return array(length);
    // array 32
    case 0xdd:
      length = dataView.getUint32(offset + 1);
      offset += 5;
      return array(length);
    // map 16:
    case 0xde:
      length = dataView.getUint16(offset + 1);
      offset += 3;
      return map(length);
    // map 32
    case 0xdf:
      length = dataView.getUint32(offset + 1);
      offset += 5;
      return map(length);
    // buffer 16
    case 0xd8:
      length = dataView.getUint16(offset + 1);
      offset += 3;
      return buf(length);
    // buffer 32
    case 0xd9:
      length = dataView.getUint32(offset + 1);
      offset += 5;
      return buf(length);
    }

    throw new Error("Unknown type 0x" + type.toString(16));
  }

  this.parse = parse;
}

export default function decode(buffer) {
  var decoder = new Decoder(buffer);
  var value = decoder.parse();
  // if (decoder.offset !== buffer.length) throw new Error((buffer.length - decoder.offset) + " trailing bytes");
  return value;
}
