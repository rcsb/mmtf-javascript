var decodeMmtf=function(){"use strict";function t(t){function r(t){for(var r={},e=0;t>e;e++){var n=a();r[n]=a()}return r}function e(r){var e=t.subarray(o,o+r);return o+=r,e}function n(r){var e=t.subarray(o,o+r);o+=r;var n=65535;if(r>n){for(var i=[],a=0;a<e.length;a+=n)i.push(String.fromCharCode.apply(null,e.subarray(a,a+n)));return i.join("")}return String.fromCharCode.apply(null,e)}function i(t){for(var r=new Array(t),e=0;t>e;e++)r[e]=a();return r}function a(){var a,s,c,f=t[o];if(0===(128&f))return o++,f;if(128===(240&f))return s=15&f,o++,r(s);if(144===(240&f))return s=15&f,o++,i(s);if(160===(224&f))return s=31&f,o++,n(s);if(224===(224&f))return a=u.getInt8(o),o++,a;switch(f){case 192:return o++,null;case 194:return o++,!1;case 195:return o++,!0;case 196:return s=u.getUint8(o+1),o+=2,e(s);case 197:return s=u.getUint16(o+1),o+=3,e(s);case 198:return s=u.getUint32(o+1),o+=5,e(s);case 199:return s=u.getUint8(o+1),c=u.getUint8(o+2),o+=3,[c,e(s)];case 200:return s=u.getUint16(o+1),c=u.getUint8(o+3),o+=4,[c,e(s)];case 201:return s=u.getUint32(o+1),c=u.getUint8(o+5),o+=6,[c,e(s)];case 202:return a=u.getFloat32(o+1),o+=5,a;case 203:return a=u.getFloat64(o+1),o+=9,a;case 204:return a=t[o+1],o+=2,a;case 205:return a=u.getUint16(o+1),o+=3,a;case 206:return a=u.getUint32(o+1),o+=5,a;case 207:return o+=9,0;case 208:return a=u.getInt8(o+1),o+=2,a;case 209:return a=u.getInt16(o+1),o+=3,a;case 210:return a=u.getInt32(o+1),o+=5,a;case 211:return o+=9,0;case 212:return c=u.getUint8(o+1),o+=2,[c,e(1)];case 213:return c=u.getUint8(o+1),o+=2,[c,e(2)];case 214:return c=u.getUint8(o+1),o+=2,[c,e(4)];case 215:return c=u.getUint8(o+1),o+=2,[c,e(8)];case 216:return c=u.getUint8(o+1),o+=2,[c,e(16)];case 217:return s=u.getUint8(o+1),o+=2,n(s);case 218:return s=u.getUint16(o+1),o+=3,n(s);case 219:return s=u.getUint32(o+1),o+=5,n(s);case 220:return s=u.getUint16(o+1),o+=3,i(s);case 221:return s=u.getUint32(o+1),o+=5,i(s);case 222:return s=u.getUint16(o+1),o+=3,r(s);case 223:return s=u.getUint32(o+1),o+=5,r(s)}throw new Error("Unknown type 0x"+f.toString(16))}var o=0,u=new DataView(t.buffer);return a()}function r(t){return new Uint8Array(t.buffer,t.byteOffset,t.byteLength)}function e(t){return new Int8Array(t.buffer,t.byteOffset,t.byteLength)}function n(t,r,e){var n,i,a,o=t.byteOffset,u=t.byteLength;if(r||(r=new Int16Array(u/2)),e){var s=new DataView(t.buffer);for(n=0,i=0,a=u/2;a>n;++n,i+=2)r[n]=s.getInt16(o+i,e)}else for(n=0,i=0,a=u/2;a>n;++n,i+=2)r[n]=t[i]<<8^t[i+1]<<0;return r}function i(t,r,e){var n,i,a,o=t.byteOffset,u=t.byteLength;if(r||(r=new Int32Array(u/4)),e){var s=new DataView(t.buffer);for(n=0,i=0,a=u/4;a>n;++n,i+=4)r[n]=s.getInt32(o+i,e)}else for(n=0,i=0,a=u/4;a>n;++n,i+=4)r[n]=t[i]<<24^t[i+1]<<16^t[i+2]<<8^t[i+3]<<0;return r}function a(t){return new Int32Array(t.buffer,t.byteOffset,t.byteLength/4)}function o(t,r,e){var n=t.length,i=1/r;e||(e=new Float32Array(n));for(var a=0;n>a;++a)e[a]=t[a]*i;return e}function u(t,r){var e,n;if(!r){var i=0;for(e=0,n=t.length;n>e;e+=2)i+=t[e+1];r=new t.constructor(i)}var a=0;for(e=0,n=t.length;n>e;e+=2)for(var o=t[e],u=t[e+1],s=0;u>s;++s)r[a]=o,a+=1;return r}function s(t){for(var r=1,e=t.length;e>r;++r)t[r]+=t[r-1];return t}function c(t,r,e){var n=t.length/2+r.length;e||(e=new Int32Array(n));for(var i=0,a=0,o=0,u=t.length;u>o;o+=2){var s=t[o],c=t[o+1];e[i]=s,0!==o&&(e[i]+=e[i-1]),i+=1;for(var f=0;c>f;++f)e[i]=e[i-1]+r[a],i+=1,a+=1}return e}function f(t,r,e,u,s){var f=t.length/4/2+r.length/2;u||(u=new Float32Array(f));var g=a(u),d=c(i(t,void 0,s),n(r,void 0,s),g);return o(d,e,u)}function g(t,r,e,n){var s=e?a(e):void 0,c=u(i(t,void 0,n),s);return o(c,r,e)}function d(n,a){function o(t){return d?-1===d.indexOf(t):!0}a=a||{};var c=a.littleEndian,d=a.ignoreFields;n instanceof ArrayBuffer&&(n=new Uint8Array(n));var v;v=n instanceof Uint8Array?t(n):n;var l,L,y=(v.numBonds||0,v.numAtoms||0),h=v.groupTypeList.length/4,b=v.chainIdList.length/4,m=v.chainsPerModel.length,U={numGroups:h,numChains:b,numModels:m};["mmtfVersion","mmtfProducer","unitCell","spaceGroup","structureId","title","date","experimentalMethods","resolution","rFree","rWork","bioAssemblyList","entityList","groupList","numBonds","numAtoms","groupsPerChain","chainsPerModel"].forEach(function(t){void 0!==v[t]&&(U[t]=v[t])});var p=v.bondAtomList;p&&o("bondAtomList")&&(U.bondAtomList=i(p,void 0,c));var I=v.bondOrderList;I&&o("bondOrderList")&&(U.bondOrderList=r(I)),U.xCoordList=f(v.xCoordBig,v.xCoordSmall,1e3,void 0,c),U.yCoordList=f(v.yCoordBig,v.yCoordSmall,1e3,void 0,c),U.zCoordList=f(v.zCoordBig,v.zCoordSmall,1e3,void 0,c);var w=v.bFactorBig,A=v.bFactorSmall;w&&A&&o("bFactorList")&&(U.bFactorList=f(w,A,100,void 0,c));var C=v.atomIdList;C&&o("atomIdList")&&(U.atomIdList=s(u(i(C,void 0,c))));var F=v.altLocList;if(F&&o("altLocList")){for(l=0,L=F.length;L>l;l+=2){var S=F[l];F[l]="?"===S?0:S.charCodeAt(0),F[l+1]=parseInt(F[l+1])}U.altLocList=u(F,new Uint8Array(y))}var O=v.occupancyList;O&&o("occupancyList")&&(U.occupancyList=g(O,100,void 0,c)),U.groupIdList=s(u(i(v.groupIdList,void 0,c))),U.groupTypeList=i(v.groupTypeList,void 0,c);var B=v.secStructList;B&&o("secStructList")&&(U.secStructList=e(B));var x=v.insCodeList;if(x&&o("insCodeList")){for(l=0,L=x.length;L>l;l+=2){var M=x[l];x[l]=null===M?0:M.charCodeAt(0),x[l+1]=parseInt(x[l+1])}U.insCodeList=u(x,new Uint8Array(h))}var P=v.sequenceIdList;P&&o("sequenceIdList")&&(U.sequenceIdList=s(u(i(P,void 0,c)))),U.chainIdList=r(v.chainIdList);var V=v.chainNameList;return V&&o("chainNameList")&&(U.chainNameList=r(V)),U}return d}();