# MILENAGE

3GPP authentication and key generation functions.

JavaScript implementation based on the C reference implementation from Annex 3 of [ETSI TS 135 206 V14.0.0 (2017-04)](http://www.etsi.org/deliver/etsi_ts/135200_135299/135206/14.00.00_60/ts_135206v140000p.pdf).

## Usage

Install from npm:

```
npm install --save milenage
```

Or:

```
yarn add milenage
```

Then:

```
const Milenage = require('milenage');

const milenage = new Milenage(op, key);

const { mac_a } = milenage.f1(rand, sqn, amf);
const { res, ck, ik, ak } = milenage.f2345(rand);

const { mac_s } = milenage.f1star(rand, sqn, amf);
const { ak_s } = milenage.f5star(rand);
```

All functions also return the OPc value as the `op_c` property:

```
const { op_c } = milenage.f1(rand, sqn, amf);
```

All inputs and outputs are `Uint8Array` instances.

Inputs:

- `op` is the **OP**: a 128-bit Operator Variant Algorithm Configuration Field that is a component of the functions f1,
f1*, f2, f3, f4, f5 and f5*.
- `key` is the **K**: a 128-bit subscriber key that is an input to the functions f1, f1*, f2, f3, f4, f5 and f5*.
- `rand` is the **RAND**: a 128-bit random challenge that is an input to the functions f1, f1*, f2, f3, f4, f5 and f5*.
- `sqn` is the **SQN**: a 48-bit sequence number that is an input to either of the functions f1 and f1*. (For f1* this input is more precisely called SQN<sub>MS</sub>.)
- `amf` is the **AMF**: a 16-bit authentication management field that is an input to the functions f1 and f1*.

Outputs:

- `op_c` is the **OPc**: The value derived from OP and K.
- `mac_a` is the **MAC-A**: a 64-bit network authentication code that is the output of the function f1.
- `res` is the **RES**: a 64-bit signed response that is the output of the function f2.
- `ck` is the **CK**: a 128-bit confidentiality key that is the output of the function f3.
- `ik` is the **IK**: a 128-bit integrity key that is the output of the function f4.
- `ak` is the **AK**: a 48-bit anonymity key that is the output of the function f5.
- `mac_s` is the **MAC-S**: a 64-bit resynchronisation authentication code that is the output of the function f1*.
- `ak_s` is the **AK-S**: a 48-bit anonymity key that is the output of the function f5*.

Illustrative example:

```
const Milenage = require('milenage');

const op = new Uint8Array([ 0x63, 0xbf, 0xa5, 0x0e, 0xe6, 0x52, 0x33, 0x65, 0xff, 0x14, 0xc1, 0xf4, 0x5f, 0x88, 0x73, 0x7d ]);
const key = new Uint8Array([ 0x46, 0x5b, 0x5c, 0xe8, 0xb1, 0x99, 0xb4, 0x9f, 0xaa, 0x5f, 0x0a, 0x2e, 0xe2, 0x38, 0xa6, 0xbc ]);
const rand = new Uint8Array([ 0xdc, 0xef, 0xf0, 0x15, 0xac, 0xa4, 0x44, 0x3b, 0xda, 0xdb, 0x05, 0x00, 0x85, 0x01, 0x08, 0xa7 ]);
const sqn = new Uint8Array([ 0x00, 0x00, 0x00, 0x00, 0x00, 0x95 ]);
const amf = new Uint8Array([ 0x80, 0x00 ]);


const milenage = new Milenage(op, key);

const { mac_a } = milenage.f1(rand, sqn, amf);
const { res, ck, ik, ak } = milenage.f2345(rand);

const { mac_s } = milenage.f1star(rand, sqn, amf);
const { ak_s } = milenage.f5star(rand);

function toHex(typedArray) {
  return Buffer.from(typedArray).toString('hex');
}

console.log('MACa:', toHex(mac_a));
console.log('RES:', toHex(res));
console.log('CK:', toHex(ck));
console.log('IK:', toHex(ik));
console.log('AK:', toHex(ak));
console.log('MACs:', toHex(mac_s));
console.log('AKs:', toHex(ak_s));
```
