const crypto = require('crypto');

const rijandael = require('./rijndael');

const ciphers = crypto.getCiphers();

const key = Uint8Array.from(crypto.randomBytes(16));
const data = Uint8Array.from(crypto.randomBytes(16));
const data2 = Uint8Array.from(crypto.randomBytes(16));

rijandael.keySchedule(key);

const rijandaelOutput = new Uint8Array(16);

rijandael.encrypt(data, rijandaelOutput);

console.log('R1', Buffer.from(rijandaelOutput));

rijandael.encrypt(data2, rijandaelOutput);

console.log('R2', Buffer.from(rijandaelOutput));

const cipher = crypto.createCipheriv('aes-128-ecb', key, Buffer.alloc(0));

let cryptoOutput = cipher.update(data);

console.log('C1', cryptoOutput);

cryptoOutput = cipher.update(data2);

console.log('C2', cryptoOutput);
