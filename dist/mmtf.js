!function(r,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t(r.MMTF=r.MMTF||{})}(this,function(r){"use strict";function t(r){function t(r){for(var t={},e=0;r>e;e++){var n=a();t[n]=a()}return t}function e(t){var e=r.subarray(i,i+t);return i+=t,e}function n(t){var e=r.subarray(i,i+t);i+=t;var n=65535;if(t>n){for(var o=[],a=0;a<e.length;a+=n)o.push(String.fromCharCode.apply(null,e.subarray(a,a+n)));return o.join("")}return String.fromCharCode.apply(null,e)}function o(r){for(var t=new Array(r),e=0;r>e;e++)t[e]=a();return t}function a(){var a,s,c,d=r[i];if(0===(128&d))return i++,d;if(128===(240&d))return s=15&d,i++,t(s);if(144===(240&d))return s=15&d,i++,o(s);if(160===(224&d))return s=31&d,i++,n(s);if(224===(224&d))return a=u.getInt8(i),i++,a;switch(d){case 192:return i++,null;case 194:return i++,!1;case 195:return i++,!0;case 196:return s=u.getUint8(i+1),i+=2,e(s);case 197:return s=u.getUint16(i+1),i+=3,e(s);case 198:return s=u.getUint32(i+1),i+=5,e(s);case 199:return s=u.getUint8(i+1),c=u.getUint8(i+2),i+=3,[c,e(s)];case 200:return s=u.getUint16(i+1),c=u.getUint8(i+3),i+=4,[c,e(s)];case 201:return s=u.getUint32(i+1),c=u.getUint8(i+5),i+=6,[c,e(s)];case 202:return a=u.getFloat32(i+1),i+=5,a;case 203:return a=u.getFloat64(i+1),i+=9,a;case 204:return a=r[i+1],i+=2,a;case 205:return a=u.getUint16(i+1),i+=3,a;case 206:return a=u.getUint32(i+1),i+=5,a;case 207:return i+=9,0;case 208:return a=u.getInt8(i+1),i+=2,a;case 209:return a=u.getInt16(i+1),i+=3,a;case 210:return a=u.getInt32(i+1),i+=5,a;case 211:return i+=9,0;case 212:return c=u.getUint8(i+1),i+=2,[c,e(1)];case 213:return c=u.getUint8(i+1),i+=2,[c,e(2)];case 214:return c=u.getUint8(i+1),i+=2,[c,e(4)];case 215:return c=u.getUint8(i+1),i+=2,[c,e(8)];case 216:return c=u.getUint8(i+1),i+=2,[c,e(16)];case 217:return s=u.getUint8(i+1),i+=2,n(s);case 218:return s=u.getUint16(i+1),i+=3,n(s);case 219:return s=u.getUint32(i+1),i+=5,n(s);case 220:return s=u.getUint16(i+1),i+=3,o(s);case 221:return s=u.getUint32(i+1),i+=5,o(s);case 222:return s=u.getUint16(i+1),i+=3,t(s);case 223:return s=u.getUint32(i+1),i+=5,t(s)}throw new Error("Unknown type 0x"+d.toString(16))}var i=0,u=new DataView(r.buffer);return a()}function e(r){return new Uint8Array(r.buffer,r.byteOffset,r.byteLength)}function n(r){return new Int8Array(r.buffer,r.byteOffset,r.byteLength)}function o(r,t){var e,n,o,a=(r.byteOffset,r.byteLength);for(t||(t=new Int16Array(a/2)),e=0,n=0,o=a/2;o>e;++e,n+=2)t[e]=r[n]<<8^r[n+1]<<0;return t}function a(r,t){var e,n,o,a=(r.byteOffset,r.byteLength);for(t||(t=new Int32Array(a/4)),e=0,n=0,o=a/4;o>e;++e,n+=4)t[e]=r[n]<<24^r[n+1]<<16^r[n+2]<<8^r[n+3]<<0;return t}function i(r){return new Int32Array(r.buffer,r.byteOffset,r.byteLength/4)}function u(r,t,e){var n=r.length,o=1/t;e||(e=new Float32Array(n));for(var a=0;n>a;++a)e[a]=r[a]*o;return e}function s(r,t){var e,n;if(!t){var o=0;for(e=0,n=r.length;n>e;e+=2)o+=r[e+1];t=new r.constructor(o)}var a=0;for(e=0,n=r.length;n>e;e+=2)for(var i=r[e],u=r[e+1],s=0;u>s;++s)t[a]=i,a+=1;return t}function c(r){for(var t=1,e=r.length;e>t;++t)r[t]+=r[t-1];return r}function d(r,t,e){var n=r.length/2+t.length;e||(e=new Int32Array(n));for(var o=0,a=0,i=0,u=r.length;u>i;i+=2){var s=r[i],c=r[i+1];e[o]=s,0!==i&&(e[o]+=e[o-1]),o+=1;for(var d=0;c>d;++d)e[o]=e[o-1]+t[a],o+=1,a+=1}return e}function f(r,t,e,n){var s=r.length/4/2+t.length/2;n||(n=new Float32Array(s));var c=i(n),f=d(a(r),o(t),c);return u(f,e,n)}function l(r,t,e){var n=e?i(e):void 0,o=s(a(r),n);return u(o,t,e)}function g(r,t){function o(r){return i?-1===i.indexOf(r):!0}t=t||{};var i=t.ignoreFields,u=(r.numBonds||0,r.numAtoms||0),d=r.groupTypeList.length/4,g=r.chainIdList.length/4,m=r.chainsPerModel.length,L={numGroups:d,numChains:g,numModels:m};["mmtfVersion","mmtfProducer","unitCell","spaceGroup","structureId","title","depositionDate","releaseDate","experimentalMethods","resolution","rFree","rWork","bioAssemblyList","entityList","groupList","numBonds","numAtoms","groupsPerChain","chainsPerModel"].forEach(function(t){void 0!==r[t]&&(L[t]=r[t])});var h="bondAtomList";r[h]&&o(h)&&(L[h]=a(r[h]));var v="bondOrderList";r[v]&&o(v)&&(L[v]=e(r[v])),L.xCoordList=f(r.xCoordBig,r.xCoordSmall,1e3),L.yCoordList=f(r.yCoordBig,r.yCoordSmall,1e3),L.zCoordList=f(r.zCoordBig,r.zCoordSmall,1e3);var y="bFactorList",p="bFactorBig",C="bFactorSmall";r[p]&&r[C]&&o(y)&&(L[y]=f(r[p],r[C],100));var I="atomIdList";r[I]&&o(I)&&(L[I]=c(s(a(r[I]))));var b="altLocList";r[b]&&o(b)&&(L[b]=s(a(r[b]),new Uint8Array(u)));var U="occupancyList";r[U]&&o(U)&&(L[U]=l(r[U],100)),L.groupIdList=c(s(a(r.groupIdList))),L.groupTypeList=a(r.groupTypeList);var x="secStructList";r[x]&&o(x)&&(L[x]=n(r[x]));var A="insCodeList";r[A]&&o(A)&&(L[A]=s(a(r[A]),new Uint8Array(d)));var w="sequenceIndexList";r[w]&&o(w)&&(L[w]=c(s(a(r[w])))),L.chainIdList=e(r.chainIdList);var F="chainNameList";return r[F]&&o(F)&&(L[F]=e(r[F])),L}function m(r){return String.fromCharCode.apply(null,r).replace(/\0/g,"")}function L(r,t,e){e=e||{};var n,o,a,i,u,s,c=e.firstModelOnly,d=t.onModel,f=t.onChain,l=t.onGroup,g=t.onAtom,L=t.onBond,h=0,v=0,y=0,p=0,C=0,I=-1,b=r.chainNameList,U=r.secStructList,x=r.insCodeList,A=r.sequenceIndexList,w=r.atomIdList,F=r.bFactorList,O=r.altLocList,S=r.occupancyList,M=r.bondAtomList,T=r.bondOrderList;for(n=0,o=r.chainsPerModel.length;o>n&&!(c&&h>0);++n){var B=r.chainsPerModel[h];for(d&&d({chainCount:B,modelIndex:h}),a=0;B>a;++a){var N=r.groupsPerChain[v];if(f){var P=m(r.chainIdList.subarray(4*v,4*v+4)),z=null;b&&(z=m(b.subarray(4*v,4*v+4))),f({groupCount:N,chainIndex:v,modelIndex:h,chainId:P,chainName:z})}for(i=0;N>i;++i){var q=r.groupList[r.groupTypeList[y]],D=q.atomNameList.length;if(l){var G=null;U&&(G=U[y]);var j=null;r.insCodeList&&(j=String.fromCharCode(x[y]));var k=null;A&&(k=A[y]),l({atomCount:D,groupIndex:y,chainIndex:v,modelIndex:h,groupId:r.groupIdList[y],groupType:r.groupTypeList[y],groupName:q.groupName,singleLetterCode:q.singleLetterCode,chemCompType:q.chemCompType,secStruct:G,insCode:j,sequenceIndex:k})}for(u=0;D>u;++u){if(g){var E=null;w&&(E=w[p]);var V=null;F&&(V=F[p]);var W=null;O&&(W=String.fromCharCode(O[p]));var H=null;S&&(H=S[p]),g({atomIndex:p,groupIndex:y,chainIndex:v,modelIndex:h,atomId:E,element:q.elementList[u],atomName:q.atomNameList[u],atomCharge:q.atomChargeList[u],xCoord:r.xCoordList[p],yCoord:r.yCoordList[p],zCoord:r.zCoordList[p],bFactor:V,altLoc:W,occupancy:H})}p+=1}if(L){var J=q.bondAtomList;for(u=0,s=q.bondOrderList.length;s>u;++u)L({atomIndex1:p-D+J[2*u],atomIndex2:p-D+J[2*u+1],bondOrder:q.bondOrderList[u]})}y+=1}v+=1}if(C=I+1,I=p-1,L&&M)for(u=0,s=M.length;s>u;u+=2){var K=M[u],Q=M[u+1];(K>=C&&I>=K||Q>=C&&I>=Q)&&L({atomIndex1:K,atomIndex2:Q,bondOrder:T?T[u/2]:null})}h+=1}}function h(r,e){r instanceof ArrayBuffer&&(r=new Uint8Array(r));var n;return n=r instanceof Uint8Array?t(r):r,g(n,e)}var v="v0.2.3";r.decode=h,r.traverse=L,r.version=v});