const bip32 = require('bip32')
const bip39 = require('bip39')
const bitcoin = require('bitcoinjs-lib');
const request = require('request-promise-native');
const axios = require('axios')
const moment = require('moment');
const express = require('express');
const router  = express.Router();
const { successResponse , errorResponse} = require('../Doeremi-Backend/lib/response');
const logStruct = (func, error) => {
    return {'func': func, 'file': 'exportWIF', error}
  }

const net = bitcoin.networks.testnet;
require('dotenv').config();


const exportWif = function(email, seed, passphrase){
try {
   //Define the (specific) network (testnet/mainnet)
const network = bitcoin.networks.testnet; // if we are using (testnet) then  we use networks.testnet 

// Derivation path (Deriving the bitcoin address from a BI49)
const path =`m/49'/1'/0'/0`; // we use  `m/49'/1'/0'/0` for testnet network
const wallet = {};
//let mnemonic = bip39.generateMnemonic()
const phrase = bip39.mnemonicToSeedSync(seed, passphrase); //The user should not forget their passphrase
let root = bip32.fromSeed(phrase, network)

let account = root.derivePath(path)
let node = account.derive(0).derive(0) 
let wif = node.toWIF();
let resp = {}
resp.email = email;
resp.wif = wif;
resp.timestamp = moment().format('YYYY-MM-DD HH:mm:ss');

return successResponse(201, resp, null, 'created');
} catch (error){
    console.error('error -> ', logStruct('exportWif', error))
    return errorResponse(error.status, error.message);
  }
}

router.post('/export', (req, res, next) => {
    const {email, seed, passphrase} = req.body
    
    const wif =  exportWif(email, seed,  passphrase);
    return res.status(wif.status).send(wif.data);
    })

module.exports=router;