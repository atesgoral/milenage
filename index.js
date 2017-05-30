const rijndael = require('./rijndael');

module.exports = function Milenage(op, k) {
  /*-------------------------------------------------------------------
   * Algorithm f1
   *-------------------------------------------------------------------
   *
   * Computes network authentication code MAC-A from key K, random
   * challenge RAND, sequence number SQN and authentication management
   * field AMF.
   *
   *-----------------------------------------------------------------*/
  function f1(rand, sqn, amf) {
    const mac_a = new Uint8Array(8);

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

    return { mac_a };
  }

   /*-------------------------------------------------------------------
    * Algorithms f2-f5
    *-------------------------------------------------------------------
    *
    * Takes key K and random challenge RAND, and returns response RES,
    * confidentiality key CK, integrity key IK and anonymity key AK.
    *
    *-----------------------------------------------------------------*/
  function f2345(rand) {
    const res = new Uint8Array(8);
    const ck = new Uint8Array(16);
    const ik = new Uint8Array(16);
    const ak = new Uint8Array(6);

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

    return { res, ck, ik, ak };
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
  function f1star(rand, sqn, amf) {
    const mac_s = new Uint8Array(8);

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

    return { mac_s };
  }

  /*-------------------------------------------------------------------
   * Algorithm f5*
   *-------------------------------------------------------------------
   *
   * Takes key K and random challenge RAND, and returns resynch
   * anonymity key AK.
   *
   *-----------------------------------------------------------------*/
  function f5star(rand) {
    const ak_s = new Uint8Array(8);

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
      ak_s[i] = out[i];

    return { ak_s };
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

  return {
    f1,
    f2345,
    f1star,
    f5star
  };
};
