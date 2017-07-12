const Milenage = require('.');

function u8a(s) {
  return Uint8Array.from(Buffer.from(s, 'hex'));
}

const op = u8a('00112233445566778899AABBCCDDEEFF');
const amf = u8a('0000');

const key = u8a('11111111111111111111111111111111');
const rand = u8a('55555555555555555555555555555555');
const sqn = u8a('000000000001');

const milenage = new Milenage(op, key);

const start = Date.now();

for (let i = 0; i < 100000; i++) {
  const { mac_a } = milenage.f1(rand, sqn, amf);
  const { res, ck, ik, ak } = milenage.f2345(rand);

  const { mac_s } = milenage.f1star(rand, sqn, amf);
  const { ak_s } = milenage.f5star(rand);
}

console.log('Elapsed', Date.now() - start);
