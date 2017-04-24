# MILENAGE

3GPP authentication and key generation functions.

JavaScript port of the C reference implementation from Annex 3 of ETSI TS 135 206 V14.0.0 (2017-04).

## Usage

Install from npm:

```
npm install --save milenage
```

Or:

```
yarn add milenage
```

Illustrative example:

```
const milenage = require('milenage');

const op = new Uint8Array([ 0x63, 0xbf, 0xa5, 0x0e, 0xe6, 0x52, 0x33, 0x65, 0xff, 0x14, 0xc1, 0xf4, 0x5f, 0x88, 0x73, 0x7d ]);
const key = new Uint8Array([ 0x46, 0x5b, 0x5c, 0xe8, 0xb1, 0x99, 0xb4, 0x9f, 0xaa, 0x5f, 0x0a, 0x2e, 0xe2, 0x38, 0xa6, 0xbc ]);
const rand = new Uint8Array([ 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xa7 ]);
const sqn = new Uint8Array([ 0x00, 0x00, 0x00, 0x00, 0x00, 0x15 ]);
const amf = new Uint8Array([ 0x80, 0x00 ]);

const mo = milenage(op).generate(key, rand, sqn, amf);

function toHex(typedArray) {
  return Buffer.from(typedArray).toString('hex');
}

console.log('mac_a:', toHex(mo.mac_a));
console.log('res:', toHex(mo.res));
console.log('ck:', toHex(mo.ck));
console.log('ik:', toHex(mo.ik));
console.log('ak:', toHex(mo.ak));
console.log('mac_s:', toHex(mo.mac_s));
console.log('ak_s:', toHex(mo.ak_s));
console.log('autn:', toHex(mo.autn));
console.log('av:', toHex(mo.av));
```
