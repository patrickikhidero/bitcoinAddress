const bitcoin = require('bitcoinjs-lib');
const crypto = require('crypto');

// first step
const preImage = Buffer.from("427472757374204275696c64657273", 'hex');
const sha256Hash = crypto.createHash('sha256').update(preImage).digest('hex');
const lockScript = bitcoin.script.compile([bitcoin.opcodes.OP_SHA256, Buffer.from(sha256Hash, 'hex'), bitcoin.opcodes.OP_EQUAL]);

const redeemScriptHex = lockScript.toString('hex');
console.log('Redeem Script:', redeemScriptHex);

// second step
const network = bitcoin.networks.testnet; // changed to testnet for testing
const p2sh = bitcoin.payments.p2sh({ redeem: { output: lockScript, network }, network });

const address = p2sh.address;
console.log('Address:', address);

// third step
const keyPair = bitcoin.ECPair.makeRandom({ network });
const txb = new bitcoin.TransactionBuilder(network);
const satoshisToSend = 100000;
const fee = 10000;

txb.addInput('12cf25913f2d497ee1fa48a9cba46ecf3402154af5e24a70f27f8d19d1b06e40', 0);
txb.addOutput(address, satoshisToSend);
txb.addOutput('tb1py3gfzfylfu5axzpquheku8jaga7uxwrpgs3qh4hntqu7jn0yh89qh97gmu', satoshisToSend - fee);

txb.sign(0, keyPair, p2sh.redeem.output, null, satoshisToSend);

const rawTx = txb.build().toHex();
console.log('Raw Transaction:', rawTx);

// fourth question
const prevTxHash = '12cf25913f2d497ee1fa48a9cba46ecf3402154af5e24a70f27f8d19d1b06e40';
const prevTxIndex = 0;

const unlockingScript = bitcoin.script.compile([Buffer.from(preImage, 'hex')]);
const unlockingScriptHex = unlockingScript.toString('hex');

const txb2 = new bitcoin.TransactionBuilder(network);
txb2.addInput(prevTxHash, prevTxIndex, null, Buffer.from(unlockingScriptHex, 'hex'));
txb2.addOutput('tb1py3gfzfylfu5axzpquheku8jaga7uxwrpgs3qh4hntqu7jn0yh89qh97gmu', satoshisToSend - fee);

txb2.sign(0, keyPair, null, bitcoin.Transaction.SIGHASH_ALL, satoshisToSend);

const rawTx2 = txb2.build().toHex();
console.log('Raw Transaction 2:', rawTx2);