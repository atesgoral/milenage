const milenage = require('..');

function hexStringToUint8Array(s) {
  return new Uint8Array(s.replace(/(..(?!$))/g, '$1,').split(',').map((xx) => parseInt(xx, 16)));
}

const op = hexStringToUint8Array('00112233445566778899AABBCCDDEEFF');
const amf = hexStringToUint8Array('0000');

const key = hexStringToUint8Array('11111111111111111111111111111111');
const rand = hexStringToUint8Array('55555555555555555555555555555555');
const sqn = hexStringToUint8Array('000000000001');

const mo = milenage(op).generate(key, rand, sqn, amf);

for (var p in mo) {
  console.log(p, Buffer.from(mo[p]).toString('hex'));
}

/* @todo assert

res = 84 0b 43 b1 00 c3 d6 83
ck = 54 6a b8 2e 49 29 16 da cb af 66 ba 9d 7e 66 54
ik = da d4 9d 69 41 f9 b9 59 63 a2 54 ff 6e 1c 31 4c
ak = 7e 23 91 70 21 cb
autn = 7e 23 91 70 21 ca 00 00 f8 60 47 d2 eb 76 59 59

*/
