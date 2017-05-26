const test = require('ava').test;

const milenage = require('..');

function u8a(s) {
  return Uint8Array.from(Buffer.from(s, 'hex'));
}

test((t) => {
  const op = u8a('00112233445566778899AABBCCDDEEFF');
  const amf = u8a('0000');

  const key = u8a('11111111111111111111111111111111');
  const rand = u8a('55555555555555555555555555555555');
  const sqn = u8a('000000000001');

  const mo = milenage(op).generate(key, rand, sqn, amf);

  t.deepEqual(mo.res, u8a('840b43b100c3d683'));
  t.deepEqual(mo.ck, u8a('546ab82e492916dacbaf66ba9d7e6654'));
  t.deepEqual(mo.ik, u8a('dad49d6941f9b95963a254ff6e1c314c'));
  t.deepEqual(mo.ak, u8a('7e23917021cb'));
});
