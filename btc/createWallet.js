//Import the required dependencies
const bip32 = require('bip32')
const bip39 = require('bip39')
const bitcoin = require('bitcoinjs-lib')
const moment = require('moment');
const express = require('express');
const cors = require('cors');
const CryptoJS = require("crypto-js");
const pinHash = require('sha256');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const autogenerate = require("./autogenerate");
const router  = express.Router();
const {successResponse, errorResponse} = require('./lib/response');

const logStruct = (func, error) => {
    return {'func': func, 'file': 'createWallet', error}
  }

const  createBTCTest = function(user, pass){
try {
//Define the (specific) network (testnet/mainnet)
const network = bitcoin.networks.testnet; // if we are using (testnet) then  we use networks.testnet 
//const validInput = validateAuth(data);
// Derivation path (Deriving the bitcoin address from a BI49)
const path =`m/49'/1'/0'/0`; // we use  `m/49'/1'/0'/0` for testnet network
const wallet = {};
let mnemonic = bip39.generateMnemonic()
const seed = bip39.mnemonicToSeedSync(mnemonic, pass); //The user should not forget their passphrase
let root = bip32.fromSeed(seed, network)

let account = root.derivePath(path)
let node = account.derive(0).derive(0)

const accountpath = "m/49'/1'/0'"; // 1' is testnet, change to 0' for mainnet
const  main_account = root.derivePath(accountpath);
const accountXPub =  main_account.neutered().toBase58();
const accountXPriv = main_account.toBase58();
console.log(accountXPriv);

let btcAddress = bitcoin.payments.p2pkh({
  pubkey: node.publicKey,
  network: network,
}).address
const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
let key = node.toWIF();
wallet.mnemonic = mnemonic;
wallet.email = validInput.username;
wallet.wif = key;
wallet.index = 0;
wallet.address = btcAddress;
wallet.xPub = accountXPub;
wallet.xPriv = accountXPriv;
wallet.createdAt = createdAt;

console.log(`
Wallet generated:
 - Address  : ${btcAddress},
 - Key : ${node.toWIF()}, 
 - Mnemonic : ${mnemonic}
     
`)
return successResponse(201, wallet, 'walletCreated');
} catch(error){
  console.error('error -> ', logStruct('createBTCTest', error))
  return errorResponse(error.status, error.message);
}
}

router.post('/testnet', (req, res, next) => {
const data = req.body

const wallet =  createBTCTest(data);
return res.status(wallet.status).send(wallet.data)
})

  

const createBTCMain = function(email, passphrase){
  try{
  //Define the (specific) network (testnet/mainnet)
  const mainnet = bitcoin.networks.bitcoin; // if we are using (mainnet) then  we use networks.bitcoin 
  
  // Derivation path (Deriving the bitcoin address from a BI49)
  const path =`m/49'/0'/0'/0`; // we use  `m/49'/0'/0'/0 for main network
  const wallet = {};
  let mnemonic = bip39.generateMnemonic()
  const seed = bip39.mnemonicToSeedSync(mnemonic, passphrase); //The user should not forget their passphrase
  let root = bip32.fromSeed(seed, mainnet)
  
  let account = root.derivePath(path)
  let node = account.derive(0).derive(0)
  
  const accountpath = "m/49'/0'/0'"; // 1' is testnet, change to 0' for mainnet
  const main_account = root.derivePath(accountpath);
  const accountXPub =  main_account.neutered().toBase58();
  const accountXPriv = main_account.toBase58();
  //let index = 0;

 // let receive = autogenerate.newP2PKHAddressMain(index, accountXPub);

  let btcAddress = bitcoin.payments.p2pkh({
    pubkey: node.publicKey,
    network: mainnet,
  }).address

  const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
  let key = node.toWIF();
  wallet.mnemonic = mnemonic;
  wallet.email = email;
  wallet.wif = key;
  wallet.index = 0;
  wallet.address = btcAddress;
  wallet.xPub = accountXPub;
  wallet.xPriv = accountXPriv;
  wallet.createdAt = createdAt;
  console.log(`
  Wallet generated:
   - Address  : ${btcAddress},
   - Key : ${node.toWIF()}, 
   - Mnemonic : ${mnemonic}
       
  `)
  return successResponse(200, wallet);
  } catch(error){
    console.error('error -> ', logStruct('createBTCMain', error))
    return errorResponse(error.status, error.message);
  }
  }

router.post('/main', (req, res, next) => {
    const {username, passphrase} = req.body
    
    const wallet =  createBTCMain(username, passphrase);
    return res.status(wallet.status).send(wallet.data);
})

const  createTestBTC = function(email, passphrase){
  try {
  //Define the (specific) network (testnet/mainnet)
  //console.log(passphrase);
  const network = bitcoin.networks.testnet; // if we are using (testnet) then  we use networks.testnet 
  
  // Derivation path (Deriving the bitcoin address from a BI49)
  const path =`m/49'/1'/0'/0`; // we use  `m/49'/1'/0'/0` for testnet network
  const wallet = {};
  let mnemonic = bip39.generateMnemonic()
  const seed = bip39.mnemonicToSeedSync(mnemonic, passphrase); //The user should not forget their passphrase
  let root = bip32.fromSeed(seed, network)
  
  let account = root.derivePath(path)
  let node = account.derive(0).derive(0)

  const accountpath = "m/49'/1'/0'"; // 1' is testnet, change to 0' for mainnet
  const  main_account = root.derivePath(accountpath);
  const accountXPub =  main_account.neutered().toBase58();
  const accountXPriv = main_account.toBase58();

  let btcAddress = bitcoin.payments.p2wpkh({
    pubkey: node.publicKey,
    network: network,
  }).address

  const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');

  let key = node.toWIF();

  wallet.mnemonic = mnemonic;
  wallet.email = email;
  wallet.wif = key;
  wallet.index = 0;
  wallet.address = btcAddress;
  wallet.xPub = accountXPub;
  wallet.xPriv = accountXPriv;
  wallet.createdAt = createdAt;

  console.log(`
  Wallet generated:
   - Address  : ${btcAddress},
   - Key : ${node.toWIF()}, 
   - Mnemonic : ${mnemonic}
       
  `)
  return successResponse(200, wallet);
  } catch(error){
    console.error('error -> ', logStruct('createTestBTC', error))
    return errorResponse(error.status, error.message);
  }
  }

  router.post('/test', (req, res, next) => {
    const {username, passphrase} = req.body 
    const wallet =  createTestBTC(username, passphrase);
    return res.status(wallet.status).send(wallet.data);
    })

const  importWallet = function(email, mnemonic, passphrase){
  try {
  //Define the (specific) network (testnet/mainnet)
  const network = bitcoin.networks.testnet; // if we are using (testnet) then  we use networks.testnet 
  
  // Derivation path (Deriving the bitcoin address from a BI49)
  const path =`m/49'/1'/0'/0`; // we use  `m/49'/1'/0'/0` for testnet network
  const wallet = {};
  //et mnemonic = seed;
  const seed = bip39.mnemonicToSeedSync(mnemonic, passphrase); //The user should not forget their passphrase
  let root = bip32.fromSeed(seed, network)
  
  let account = root.derivePath(path)
  let node = account.derive(0).derive(0)
  const accountpath = "m/49'/1'/0'"; // 1' is testnet, change to 0' for mainnet
  const  main_account = root.derivePath(accountpath);
  const accountXPub =  main_account.neutered().toBase58();
  const accountXPriv = main_account.toBase58();
  let btcAddress = bitcoin.payments.p2pkh({
    pubkey: node.publicKey,
    network: network,
  }).address
  const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
  let key = node.toWIF();
  wallet.mnemonic = mnemonic;
  wallet.email = email;
  wallet.wif = key;
  wallet.index = 0;
  wallet.address = btcAddress;
  wallet.xPub = accountXPub;
  wallet.xPriv = accountXPriv;
  wallet.createdAt = createdAt;
  console.log(`
  Wallet generated:
   - Address  : ${btcAddress},
   - Key : ${node.toWIF()}, 
   - Mnemonic : ${mnemonic}
       
  `)
  return successResponse(200, wallet);
  } catch(error){wallet
    console.error('error -> ', logStruct('importWallet', error))
    return errorResponse(error.status, error.message);
  }
  }

  router.post('/import', (req, res, next) => {
    const {username, mnemonic, passphrase} = req.body
    
    const wallet =  importWallet(username, mnemonic, passphrase);
    return res.status(wallet.status).send(wallet.data)
    })

    const  importWalletMain = function(email, mnemonic, passphrase){
      try {
      //Define the (specific) network (testnet/mainnet)
      const network = bitcoin.networks.bitcoin; // if we are using (testnet) then  we use networks.testnet 
      
      // Derivation path (Deriving the bitcoin address from a BI49)
      const path =`m/49'/0'/0'/1`; // we use  `m/49'/1'/0'/0` for testnet network
      const wallet = {};
      //et mnemonic = seed;
      const seed = bip39.mnemonicToSeedSync(mnemonic, passphrase); //The user should not forget their passphrase
      let root = bip32.fromSeed(seed, network)
      
      let account = root.derivePath(path)
      let node = account.derive(0).derive(0)
      const accountpath = "m/49'/0'/0'"; // 1' is testnet, change to 0' for mainnet
      const  main_account = root.derivePath(accountpath);
      const accountXPub =  main_account.neutered().toBase58();
      const accountXPriv = main_account.toBase58();
      let btcAddress = bitcoin.payments.p2pkh({
        pubkey: node.publicKey,
        network: network,
      }).address
      const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
      let key = node.toWIF();
      wallet.mnemonic = mnemonic;
      wallet.email = email;
      wallet.wif = key;
      wallet.index = 0;
      wallet.address = btcAddress;
      wallet.xPub = accountXPub;
      wallet.xPriv = accountXPriv;
      wallet.createdAt = createdAt;
      console.log(`
      Wallet generated:
       - Address  : ${btcAddress},
       - Key : ${node.toWIF()}, 
       - Mnemonic : ${mnemonic}
           
      `)
      return successResponse(200, wallet);
      } catch(error){
        console.error('error -> ', logStruct('importWalletMain', error))
        return errorResponse(error.status, error.message);
      }
      }

      router.post('/main/import', function(req, res, next) {
        const {username, mnemonic, passphrase} = req.body
        
        const wallet =  importWalletMain(username, mnemonic, passphrase);
        return res.status(wallet.status).send(wallet.data)
        })

    const getReceiveAddress = function (index, xPubKey) {
      try { 
        let receive = autogenerate.newP2PKHAddress(index, xPubKey);
        return  successResponse(200, receive)
     } catch(error){
        console.error('error -> ', logStruct('getReceiveAddress', error))
        return errorResponse(error.status, error.message);
     }
    }

    router.post('/receive', function(req, res, next) {
      const {index, xPub} = req.body
      const response =  getReceiveAddress(index, xPub);
      return res.status(response.status).send(response.data)
     });
    
     const getReceiveAddressMain = function (index, pass, key) {
      try { 
        let receive = autogenerate.receivePaymentAddressMain(index, pass, key);
        return  successResponse(200, receive)
     } catch(error){
        console.error('error -> ', logStruct('getReceiveAddressMain', error))
        return errorResponse(error.status, error.message);
     }
    } 

    router.post('/main/receive', function(req, res, next) {
      const {index, pass, key} = req.body
      const response =  getReceiveAddressMain(index, pass, key);
      return res.status(response.status).send(response.data)
     });

     const getReceiveAddressP = function (index, xPubKey) {
      try { 
        let receive = autogenerate.newP2WPKHAddress(index, xPubKey);
        return  successResponse(200, receive)
     } catch(error){
        console.error('error -> ', logStruct('getReceiveAddressP', error))
        return errorResponse(error.status, error.message);
     }
    }

    router.post('/receivep', function(req, res, next) {
      const {index, xPub} = req.body
      const response =  getReceiveAddressP(index, xPub);
      return res.status(response.status).send(response.data)
     });

     const getCurrentWif = function (index, pass, key) {
      try { 
        let curr_wif = autogenerate.receivePaymentAddress(index, pass, key);
        return  successResponse(200, curr_wif)
     } catch(error){
        console.error('error -> ', logStruct('getCurrentWif', error))
        return errorResponse(error.status, error.message);
     }
    }
  
     router.post('/getWIF', function(req, res, next) {
      const {index, pass, key} = req.body
      const response =  getCurrentWif(index, pass, key);
      return res.status(response.status).send(response.data)
     });

     const getCurrentWifMain = function (index, pass, key) {
      try { 
        let curr_wif = autogenerate.receivePaymentAddressMain(index, pass, key);
        return  successResponse(200, curr_wif)
     } catch(error){
        console.error('error -> ', logStruct('getCurrentWifMain', error))
        return errorResponse(error.status, error.message);
     }
    }
    
    router.post('/main/getWIF', function(req, res, next) {
      const {index, pass, key} = req.body
      const response =  getCurrentWifMain(index, pass, key);
      return res.status(response.status).send(response.data)
     });

     const getCurrentWifP = function (index, pass, key) {
      try { 
        let curr_wif = autogenerate.receiveP2WPKHPayment(index, pass, key);
        return  successResponse(200, curr_wif)
     } catch(error){
        console.error('error -> ', logStruct('getCurrentWifP', error))
        return errorResponse(error.status, error.message);
     }
    }

    router.post('/getWIFP', function(req, res, next) {
      const {index, pass, key} = req.body
      const response =  getCurrentWifP(index, pass, key);
      return res.status(response.status).send(response.data)
     });



module.exports = router;