const bitcoin = require('bitcoinjs-lib');
const crypto = require('crypto');

// first step
const preImage = Buffer.from("427472757374204275696c64657273", 'hex');
const sha256Hash = crypto.createHash('sha256').update(preImage).digest('hex');
const lockScript = bitcoin.script.compile([bitcoin.opcodes.OP_SHA256, Buffer.from(sha256Hash, 'hex'), bitcoin.opcodes.OP_EQUAL]);

const redeemScriptHex = lockScript.toString('hex');
console.log('Redeem Script:', redeemScriptHex);

// second step
const network = bitcoin.networks.testnet;
const p2sh = bitcoin.payments.p2sh({ redeem: { output: lockScript, network }, network });

const address = p2sh.address;
console.log('Address:', address);

// third step
const keyPair = bitcoin.ECPair.makeRandom({ network });
const txb = new bitcoin.TransactionBuilder(network);
const satoshisToSend = 100000;
const fee = 10000;

const prevTxHash = '49239eb7285257428a2864ae9775b74e1ee9c580d7a24e88bc5d6b760e14cc0c';
const prevTxIndex = 0;

txb.addInput(prevTxHash, prevTxIndex);  
txb.addOutput(address, satoshisToSend - fee);

const changeAddress = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network }).address;
txb.addOutput(changeAddress, fee);

txb.sign(0, keyPair);

const rawTx = txb.build().toHex();
console.log('Raw Transaction:', rawTx);

// fourth question

const unlockingScript = bitcoin.script.compile([Buffer.from(sha256Hash, 'hex')]);
const unlockingScriptHex = unlockingScript.toString('hex');

const p2pkhAddress = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network }).address;

const txb2 = new bitcoin.TransactionBuilder(network);
txb2.addInput(prevTxHash, prevTxIndex, 0, Buffer.from(unlockingScriptHex, 'hex')); // Add the input with unlocking script
txb2.addOutput(p2pkhAddress, satoshisToSend - fee);

txb2.sign(0, keyPair, bitcoin.payments.p2sh({ redeem: { output: lockScript }, network }).redeem.output);

const rawTx2 = txb2.build().toHex();
console.log('Raw Transaction 2:', rawTx2);
