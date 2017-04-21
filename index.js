const rijndael = require('./rijndael');

function computeAutn(sqn, ak, amf, mac_a, autn) {
  let i;

  /* xor SQN and AK */
  for (i = 0; i < 6; i++) {
    autn[i] = sqn[i] ^ ak[i];
  }

  // @todo use autn.set

  /* append AMF */
  for (i = 0; i < 2; i++) {
    autn[i + 6] = amf[i];
  }

  /* append MAC */
  for (i = 0; i < 8; i++) {
    autn[i + 8] = mac_a[i];
  }
}

function computeAv(rand, res, ck, ik, autn, av) {
  let i;

  // @todo use av.set

  /* put RAND */
  for (i = 0; i < 16; i++) {
    av[i] = rand[i];
  }

  /* append XRES */
  for (i = 0; i < 8; i++) {
    av[i + 16] = res[i];
  }

  /* append CK */
  for (i = 0; i < 16; i++) {
    av[i + 24] = ck[i];
  }

  /* append IK */
  for (i = 0; i < 16; i++) {
    av[i + 40] = ik[i];
  }

  /* append AUTN */
  for (i = 0; i < 16; i++) {
    av[i + 56] = autn[i];
  }
}

module.exports = (op) => {
  /*-------------------------------------------------------------------
   * Algorithm f1
   *-------------------------------------------------------------------
   *
   * Computes network authentication code MAC-A from key K, random
   * challenge RAND, sequence number SQN and authentication management
   * field AMF.
   *
   *-----------------------------------------------------------------*/
  function f1(k, rand, sqn, amf, mac_a) {
    const op_c = new Uint8Array(16);
    const temp = new Uint8Array(16);
    const in1 = new Uint8Array(16);
    const out1 = new Uint8Array(16);
    const rijndaelInput = new Uint8Array(16);
    let i;

    rijndael.keySchedule(k);

    computeOpc(op_c);

    for (i = 0; i < 16; i++) // @todo unroll?
      rijndaelInput[i] = rand[i] ^ op_c[i];

    rijndael.encrypt(rijndaelInput, temp);

    for (i = 0; i < 6; i++) { // @todo unroll?
      in1[i] = sqn[i];
      in1[i + 8] = sqn[i];
    }

    for (i = 0; i < 2; i++) { // @todo unroll?
      in1[i + 6] = amf[i];
      in1[i + 14] = amf[i];
    }

    /* XOR op_c and in1, rotate by r1=64, and XOR *
     * on the constant c1 (which is all zeroes) */

    for (i = 0; i < 16; i++)
      rijndaelInput[(i + 8) % 16] = in1[i] ^ op_c[i];

    /* XOR on the value temp computed before */
    for (i = 0; i < 16; i++)
      rijndaelInput[i] ^= temp[i];

    rijndael.encrypt(rijndaelInput, out1);

    for (i = 0; i < 16; i++)
      out1[i] ^= op_c[i];

    for (i = 0; i < 8; i++)
      mac_a[i] = out1[i];
  }

   /*-------------------------------------------------------------------
    * Algorithms f2-f5
    *-------------------------------------------------------------------
    *
    * Takes key K and random challenge RAND, and returns response RES,
    * confidentiality key CK, integrity key IK and anonymity key AK.
    *
    *-----------------------------------------------------------------*/
  function f2345(k, rand, res, ck, ik, ak) {
    const op_c = new Uint8Array(16);
    const temp = new Uint8Array(16);
    const out = new Uint8Array(16);
    const rijndaelInput = new Uint8Array(16);
    let i;

    rijndael.keySchedule(k);

    computeOpc(op_c);

    for (i = 0; i < 16; i++)
      rijndaelInput[i] = rand[i] ^ op_c[i];

    rijndael.encrypt(rijndaelInput, temp);

    /* To obtain output block OUT2: XOR OPc and TEMP, *
     * rotate by r2=0, and XOR on the constant c2 (which *
     * is all zeroes except that the last bit is 1). */

    for (i = 0; i < 16; i++)
      rijndaelInput[i] = temp[i] ^ op_c[i];

    rijndaelInput[15] ^= 1;

    rijndael.encrypt(rijndaelInput, out);

    for (i = 0; i < 16; i++)
      out[i] ^= op_c[i];

    for (i = 0; i < 8; i++)
      res[i] = out[i + 8];

    for (i = 0; i < 6; i++)
      ak[i] = out[i];

    /* To obtain output block OUT3: XOR OPc and TEMP, *
     * rotate by r3=32, and XOR on the constant c3 (which *
     * is all zeroes except that the next to last bit is 1). */

    for (i = 0; i < 16; i++)
      rijndaelInput[(i + 12) % 16] = temp[i] ^ op_c[i];

    rijndaelInput[15] ^= 2;

    rijndael.encrypt(rijndaelInput, out);

    for (i = 0; i < 16; i++)
      out[i] ^= op_c[i];

    for (i = 0; i < 16; i++)
      ck[i] = out[i];

    /* To obtain output block OUT4: XOR OPc and TEMP, *
     * rotate by r4=64, and XOR on the constant c4 (which *
     * is all zeroes except that the 2nd from last bit is 1). */

    for (i = 0; i < 16; i++)
      rijndaelInput[(i + 8) % 16] = temp[i] ^ op_c[i];

    rijndaelInput[15] ^= 4;

    rijndael.encrypt(rijndaelInput, out);

    for (i = 0; i < 16; i++)
      out[i] ^= op_c[i];

    for (i = 0; i < 16; i++)
      ik[i] = out[i];
  }

  /*-------------------------------------------------------------------
   * Algorithm f1*
   *-------------------------------------------------------------------
   *
   * Computes resynch authentication code MAC-S from key K, random
   * challenge RAND, sequence number SQN and authentication management
   * field AMF.
   *
   *-----------------------------------------------------------------*/
  function f1star(k, rand, sqn, amf, mac_s) {
    const op_c = new Uint8Array(16);
    const temp = new Uint8Array(16);
    const in1 = new Uint8Array(16);
    const out1 = new Uint8Array(16);
    const rijndaelInput = new Uint8Array(16);
    let i;

    rijndael.keySchedule(k);

    computeOpc(op_c);

    for (i = 0; i < 16; i++)
      rijndaelInput[i] = rand[i] ^ op_c[i];

    rijndael.encrypt(rijndaelInput, temp);

    for (i = 0; i < 6; i++) {
      in1[i] = sqn[i];
      in1[i + 8] = sqn[i];
    }

    for (i = 0; i < 2; i++) {
      in1[i + 6] = amf[i];
      in1[i + 14] = amf[i];
    }

    /* XOR op_c and in1, rotate by r1=64, and XOR *
     * on the constant c1 (which is all zeroes) */

    for (i = 0; i < 16; i++)
      rijndaelInput[(i + 8) % 16] = in1[i] ^ op_c[i];

    /* XOR on the value temp computed before */
    for (i = 0; i < 16; i++)
      rijndaelInput[i] ^= temp[i];

    rijndael.encrypt(rijndaelInput, out1);

    for (i = 0; i < 16; i++)
      out1[i] ^= op_c[i];

    for (i = 0; i < 8; i++)
      mac_s[i] = out1[i + 8];
  }

  /*-------------------------------------------------------------------
   * Algorithm f5*
   *-------------------------------------------------------------------
   *
   * Takes key K and random challenge RAND, and returns resynch
   * anonymity key AK.
   *
   *-----------------------------------------------------------------*/
  function f5star(k, rand, ak) {
    const op_c = new Uint8Array(16);
    const temp = new Uint8Array(16);
    const out = new Uint8Array(16);
    const rijndaelInput = new Uint8Array(16);
    let i;

    rijndael.keySchedule(k);

    computeOpc(op_c);

    for (i = 0; i < 16; i++)
      rijndaelInput[i] = rand[i] ^ op_c[i];

    rijndael.encrypt(rijndaelInput, temp);

    /* To obtain output block OUT5: XOR OPc and TEMP, *
    * rotate by r5=96, and XOR on the constant c5 (which *
    * is all zeroes except that the 3rd from last bit is 1). */
    for (i = 0; i < 16; i++)
      rijndaelInput[(i + 4) % 16] = temp[i] ^ op_c[i];

    rijndaelInput[15] ^= 8;

    rijndael.encrypt(rijndaelInput, out);

    for (i = 0; i < 16; i++)
      out[i] ^= op_c[i];

    for (i = 0; i < 6; i++)
      ak[i] = out[i];
  }

  /*-------------------------------------------------------------------
   * Function to compute OPc from OP and K. Assumes key schedule has
   * already been performed.
   *-----------------------------------------------------------------*/
  function computeOpc(op_c) {
    let i;

    rijndael.encrypt(op, op_c);

    for (i = 0; i < 16; i++)
      op_c[i] ^= op[i];
  }

  function generate(k, rand, sqn, amf) {
    const mac_a = new Uint8Array(8);

    f1(k, rand, sqn, amf, mac_a);

    const res = new Uint8Array(8);
    const ck = new Uint8Array(16);
    const ik = new Uint8Array(16);
    const ak = new Uint8Array(6);

    f2345(k, rand, res, ck, ik, ak);

    const mac_s = new Uint8Array(8);

    f1star(k, rand, sqn, amf, mac_s);

    const ak_s = new Uint8Array(8);

    f5star(k, rand, ak_s);

    const autn = new Uint8Array(16);

    computeAutn(sqn, ak, amf, mac_a, autn);

    const av = new Uint8Array(72);

    computeAv(rand, res, ck, ik, autn, av);

    return {
      mac_a,
      res,
      ck,
      ik,
      ak,
      mac_s,
      ak_s,
      autn,
      av
    };
  }

  return {
    generate
  };
};
