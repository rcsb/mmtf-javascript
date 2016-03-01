
( function( global ) {

    'use strict';

    // Console-polyfill. MIT license.
    // https://github.com/paulmillr/console-polyfill
    // Make it safe to do console.log() always.

    global.console = global.console || {};
    var con = global.console;
    var prop, method;
    var empty = {};
    var dummy = function(){};
    var properties = 'memory'.split( ',' );
    var methods = (
        'assert,clear,count,debug,dir,dirxml,error,exception,group,' +
        'groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,' +
        'show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn'
    ).split(',');

    while( prop = properties.pop() ) if( !con[ prop] ) con[ prop ] = empty;
    while( method = methods.pop() ) if( !con[ method] ) con[ method ] = dummy;

    // Using `this` for web workers while maintaining compatibility with browser
    // targeted script loaders such as Browserify or Webpack where the only way to
    // get to the global object is via `window`.

} )( typeof window === 'undefined' ? this : window );


// Production steps of ECMA-262, Edition 6, 22.1.2.1
// Reference: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.from
if (!Array.from) {

    Array.from = (function () {

        var toStr = Object.prototype.toString;
        var isCallable = function (fn) {
            return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
        };
        var toInteger = function (value) {
            var number = Number(value);
            if (isNaN(number)) { return 0; }
            if (number === 0 || !isFinite(number)) { return number; }
            return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
        };
        var maxSafeInteger = Math.pow(2, 53) - 1;
        var toLength = function (value) {
            var len = toInteger(value);
            return Math.min(Math.max(len, 0), maxSafeInteger);
        };

        // The length property of the from method is 1.
        return function from(arrayLike/*, mapFn, thisArg */) {

            // 1. Let C be the this value.
            var C = this;

            // 2. Let items be ToObject(arrayLike).
            var items = Object(arrayLike);

            // 3. ReturnIfAbrupt(items).
            if (arrayLike == null) {
                throw new TypeError("Array.from requires an array-like object - not null or undefined");
            }

            // 4. If mapfn is undefined, then let mapping be false.
            var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
            var T;
            if (typeof mapFn !== 'undefined') {
                // 5. else
                // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
                if (!isCallable(mapFn)) {
                    throw new TypeError('Array.from: when provided, the second argument must be a function');
                }

                // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
                if (arguments.length > 2) {
                    T = arguments[2];
                }
            }

            // 10. Let lenValue be Get(items, "length").
            // 11. Let len be ToLength(lenValue).
            var len = toLength(items.length);

            // 13. If IsConstructor(C) is true, then
            // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
            // 14. a. Else, Let A be ArrayCreate(len).
            var A = isCallable(C) ? Object(new C(len)) : new Array(len);

            // 16. Let k be 0.
            var k = 0;
            // 17. Repeat, while k < len… (also steps a - h)
            var kValue;
            while (k < len) {
                kValue = items[k];
                if (mapFn) {
                    A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
                } else {
                    A[k] = kValue;
                }
                k += 1;
            }
            // 18. Let putStatus be Put(A, "length", len, true).
            A.length = len;
            // 20. Return A.
            return A;
        };

    }());

}


// https://github.com/ttaubert/node-arraybuffer-slice
// (c) 2014 Tim Taubert <tim@timtaubert.de>
// arraybuffer-slice may be freely distributed under the MIT license.
(function (undefined) {
  "use strict";

  function clamp(val, length) {
    val = (val|0) || 0;

    if (val < 0) {
      return Math.max(val + length, 0);
    }

    return Math.min(val, length);
  }

  if (!ArrayBuffer.prototype.slice) {
    ArrayBuffer.prototype.slice = function (from, to) {
      var length = this.byteLength;
      var begin = clamp(from, length);
      var end = length;

      if (to !== undefined) {
        end = clamp(to, length);
      }

      if (begin > end) {
        return new ArrayBuffer(0);
      }

      var num = end - begin;
      var target = new ArrayBuffer(num);
      var targetArray = new Uint8Array(target);

      var sourceArray = new Uint8Array(this, begin, num);
      targetArray.set(sourceArray);

      return target;
    };
  }
})();


// workaround for phantomjs not allowing Typed Array as argument in Function.apply
// from https://gist.github.com/imaya/9825990
if (self.Uint8Array !== void 0) {
  try {
    String.fromCharCode.apply(null, new Uint8Array([0]));
  } catch(e) {
    String.fromCharCode.apply = (function(fromCharCodeApply) {
      return function(thisobj, args) {
        return fromCharCodeApply.call(String.fromCharCode, thisobj, Array.prototype.slice.call(args));
      }
    })(String.fromCharCode.apply);
  }
}


// @license http://opensource.org/licenses/MIT
// copyright Paul Irish 2015
(function(){
  if ("performance" in self == false) {
      self.performance = {};
  }
  Date.now = (Date.now || function () {  // thanks IE8
      return new Date().getTime();
  });
  if ("now" in self.performance == false){
    var nowOffset = Date.now();
    if (performance.timing && performance.timing.navigationStart){
      nowOffset = performance.timing.navigationStart
    }
    self.performance.now = function now(){
      return Date.now() - nowOffset;
    }
  }
})();


if( !Object.assign ){

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign

    Object.defineProperty( Object, "assign", {

        enumerable: false,
        configurable: true,
        writable: true,

        value: function(target, firstSource) {

            "use strict";
            if (target === undefined || target === null)
            throw new TypeError("Cannot convert first argument to object");

            var to = Object(target);

            var hasPendingException = false;
            var pendingException;

            for (var i = 1; i < arguments.length; i++) {

                var nextSource = arguments[i];
                if (nextSource === undefined || nextSource === null)
                    continue;

                var keysArray = Object.keys(Object(nextSource));
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {

                    var nextKey = keysArray[nextIndex];
                    try {
                        var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                        if (desc !== undefined && desc.enumerable)
                            to[nextKey] = nextSource[nextKey];
                    } catch (e) {
                        if (!hasPendingException) {
                            hasPendingException = true;
                            pendingException = e;
                        }
                    }

                }

                if (hasPendingException)
                    throw pendingException;

            }

            return to;

        }

    } );

}
