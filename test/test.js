const test = require('ava').test;

const Milenage = require('..');

function u8a(s) {
  return Uint8Array.from(Buffer.from(s, 'hex'));
}

test('op_c', (t) => {
  const op = u8a('00112233445566778899AABBCCDDEEFF');
  const key = u8a('11111111111111111111111111111111');

  const milenage = new Milenage({ op, key });

  const op_c = milenage.op_c();

  t.deepEqual(op_c, u8a('a02c025b3be2563be23da39144606a55'));
});

test('All functions with OP', (t) => {
  const op = u8a('00112233445566778899AABBCCDDEEFF');
  const amf = u8a('0000');

  const key = u8a('11111111111111111111111111111111');
  const rand = u8a('55555555555555555555555555555555');
  const sqn = u8a('000000000001');

  const milenage = new Milenage({ op, key });

  const { op_c, mac_a } = milenage.f1(rand, sqn, amf);
  const { res, ck, ik, ak } = milenage.f2345(rand);

  const { mac_s } = milenage.f1star(rand, sqn, amf);
  const { ak_s } = milenage.f5star(rand);

  t.deepEqual(op_c, u8a('a02c025b3be2563be23da39144606a55'));
  t.deepEqual(mac_a, u8a('f86047d2eb765959'));
  t.deepEqual(res, u8a('840b43b100c3d683'));
  t.deepEqual(ck, u8a('546ab82e492916dacbaf66ba9d7e6654'));
  t.deepEqual(ik, u8a('dad49d6941f9b95963a254ff6e1c314c'));
  t.deepEqual(ak, u8a('7e23917021cb'));

  t.deepEqual(mac_s, u8a('357e7426980abe63'));
  t.deepEqual(ak_s, u8a('429a4587dce30000'));
});

test('All functions with OPc', (t) => {
  const op_c_in = u8a('a02c025b3be2563be23da39144606a55');
  const amf = u8a('0000');

  const key = u8a('11111111111111111111111111111111');
  const rand = u8a('55555555555555555555555555555555');
  const sqn = u8a('000000000001');

  const milenage = new Milenage({ op_c: op_c_in, key });

  const { op_c, mac_a } = milenage.f1(rand, sqn, amf);
  const { res, ck, ik, ak } = milenage.f2345(rand);

  const { mac_s } = milenage.f1star(rand, sqn, amf);
  const { ak_s } = milenage.f5star(rand);

  t.deepEqual(op_c, u8a('a02c025b3be2563be23da39144606a55'));
  t.deepEqual(mac_a, u8a('f86047d2eb765959'));
  t.deepEqual(res, u8a('840b43b100c3d683'));
  t.deepEqual(ck, u8a('546ab82e492916dacbaf66ba9d7e6654'));
  t.deepEqual(ik, u8a('dad49d6941f9b95963a254ff6e1c314c'));
  t.deepEqual(ak, u8a('7e23917021cb'));

  t.deepEqual(mac_s, u8a('357e7426980abe63'));
  t.deepEqual(ak_s, u8a('429a4587dce30000'));
});
