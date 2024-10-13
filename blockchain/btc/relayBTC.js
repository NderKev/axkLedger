
   const bitcoin = require('bitcoinjs-lib');
   const bip32 = require('bip32')
   const bip39 = require('bip39')
   const axios = require('axios');
   const moment = require('moment');
   const express = require('express');
   const autogenerate = require("./autogenerate");
   const config = require('../config');
   const cmp_token = config.COIN_MARKET_CAP;
   const mainnet = config.MAINNET_URL;
   const router  = express.Router();
   const {successResponse, errorResponse} = require('./lib/response');
   const CryptoJS = require("crypto-js");
   const bcrypt = require('bcryptjs');
   const pinHash = require('sha256');
   const transactions = require('../../server/psql/models/transactions');
   const { check, validationResult } = require('express-validator');
   const { validateToken, validateAdmin } = require('../../server/psql/middleware/auth');
   const {authenticateUser, authenticateAdmin, authenticatePin, authenticatePinAdmin} = require('../../server/psql/controllers/auth');
   const walletModel = require('../../server/psql/models/wallet');
  
   const logStruct = (func, error) => {
    return {'func': func, 'file': 'relayBTC', error}
  }
  
   
   let test_api = config.TESTNET_API;
   let test_tx = config.TESTNET_TX;
   let main_tx = config.MAINNET_TX;
  // let token = config.TOKEN;
   let decode = config.TESTNET_DECODE;
   let push = config.TESTNET_PUSH;
   let decodemain = config.MAINNET_DECODE;
   let pushmain = config.MAINNET_PUSH;
   let token = config.BLOCKCIPHER_TOKEN;
   

   
   const decodeRawTransaction = async(rawTx, token)=>{
     try {
       const tx = JSON.stringify(rawTx);
       let decode_url = `${decode}?token=${token}`
       const config = {
        method : 'post',
        url : decode_url,
        headers: { },
        data : tx
      }
       let response = await axios(config);
       return  successResponse(200, response.data);
     } catch(error){
      console.error('error -> ', logStruct('decodeRawTransaction', error))
      return errorResponse(error.status, error.message);
    }
   }
 
   const decodeRawTransactionMain = async(rawTx, token)=>{
    try {
      //const tx = JSON.stringify(rawTx);
      let decode_url = `${decodemain}?token=${token}`
      const config = {
       method : 'post',
       url : decode_url,
       headers: { },
       data : rawTx
     }
      let response = await axios(config);
      
      return  successResponse(200, response.data);
    } catch(error){
     console.error('error -> ', logStruct('decodeRawTransactionMain', error))
     return errorResponse(error.status, error.message);
   }
  }
   const pushRawTransaction = async(rawTx, token)=>{
    try {
      const tx = JSON.stringify(rawTx);
      let push_url = `${push}?token=${token}`
      const config = {
        method : 'post',
        url : push_url,
        headers: { },
        data : tx
      }
      let response = await axios(config);
      return  successResponse(200, response.data);
    } catch(error){
     console.error('error -> ', logStruct('pushRawTransaction', error))
     return errorResponse(error.status, error.message);
   }
  }

  const pushRawTransactionCr = async(rawTx, token)=>{
    try {
      
      let push_url = `${push}?token=${token}`
      const config = {
        method : 'post',
        url : push_url,
        headers: { },
        data : rawTx
      }
      let response = await axios(config);
      return  successResponse(200, response.data);
    } catch(error){
     console.error('error -> ', logStruct('pushRawTransactionCr', error))
     return errorResponse(error.status, error.message);
   }
  }

  const pushRawTransactionMain = async(rawTx, token)=>{
    try {
      
      let push_url = `${pushmain}?token=${token}`
      const config = {
        method : 'post',
        url : push_url,
        headers: { },
        data : rawTx
      }
      let response = await axios(config);
      return  successResponse(200, response.data);
    } catch(error){
     console.error('error -> ', logStruct('pushRawTransactionMain', error))
     return errorResponse(error.status, error.message);
   }
  }
  

  const getTransactions = async(addr, token) => {
    try {
      let test_url = `${test_api}/${addr}/full?limit=50?token=${token}`
      let response = await axios(test_url);
      console.log(JSON.stringify(response.data));
      return  successResponse(200, response.data);
  } catch(error){
      console.error('error -> ', logStruct('getTransactions', error))
      return errorResponse(error.status, error.message);
   }
  }
  const getTransactionsMain = async(addr, token) => {
    try {
      let test_url = `${mainnet}/${addr}/full?limit=50?token=${token}`
      let response = await axios(test_url);
      console.log(JSON.stringify(response.data));
      return  successResponse(200, response.data);
  } catch(error){
      console.error('error -> ', logStruct('getTransactionsMain', error))
      return errorResponse(error.status, error.message);
   }
  }
  const fetchUnspents = async(address, token) => { 
    try {
      const unspents = await axios(`${test_api}/${address}?unspentOnly=true?token=${token}`);
      console.log(JSON.stringify(unspents.data));
      return   successResponse(200, unspents.data)
  } catch(error){
      console.error('error -> ', logStruct('fetchUnspents', error))
      return errorResponse(error.status, error.message);
  }
  }

  const fetchUnspentsMain = async(address, token) => { 
    try {
      const unspents = await axios(`${mainnet}/${address}?unspentOnly=true?token=${token}`);
      console.log(JSON.stringify(unspents.data));
      return   successResponse(200, unspents.data)
  } catch(error){
      console.error('error -> ', logStruct('fetchUnspentsMain', error))
      return errorResponse(error.status, error.message);
  }
  }

  const fetchHash = async(tx_hash, token) => {
    try {
      let url = `${test_tx}/${tx_hash}?includeHex=true`;
      const hashes = await axios(url);
      console.log(hashes.data);
      return  successResponse(200, hashes.data)
   } catch(error){
      console.error('error -> ', logStruct('fetchHash', error))
      return errorResponse(error.status, error.message);
   }
  } 

  const fetchHashMain = async(tx_hash, token) => {
    try {
      let url = `${main_tx}/${tx_hash}?includeHex=true`;
      const hashes = await axios(url);
      console.log(hashes.data);
      return  successResponse(200, hashes.data)
   } catch(error){
      console.error('error -> ', logStruct('fetchHashMain', error))
      return errorResponse(error.status, error.message);
   }
  }

  const getBalance = async(address) => {
    try { 
      let checkUrl = `${test_api}/${address}/balance`
      let reqBtcBal = await axios(checkUrl);
      return  successResponse(200, reqBtcBal.data)
   } catch(error){
      console.error('error -> ', logStruct('getBalance', error))
      return errorResponse(error.status, error.message);
   }
  }

  const getBalanceMain = async(address) => {
    try { 
      let checkUrl = `${mainnet}/${address}/balance`
      let reqBtcBal = await axios(checkUrl);
      return  successResponse(200, reqBtcBal.data)
   } catch(error){
      console.error('error -> ', logStruct('getBalanceMain', error))
      return errorResponse(error.status, error.message);
   }
  }

  const checkBtcPrice = async () => {
    try {
      let btc_url_cmp = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=BTC&CMC_PRO_API_KEY='
      let test_url = `${btc_url_cmp}${cmp_token}`
      let response = await axios(test_url);
      //console.log(JSON.stringify(response.data));
      return  successResponse(200, response.data.data.BTC.quote.USD.price);
  } catch(error){
      console.error('error -> ', logStruct('checkBtcPrice', error))
      return errorResponse(error.status, error.message);
   }
  }

  const psbtTransactionBuilder = async(sendFrom, keystore, sendTo, amount,  indexer, key, passphrase) => {
    try {
     const TESTNET = bitcoin.networks.testnet;
     const psbt = new bitcoin.Psbt({network : TESTNET})
     const keyPair = bitcoin.ECPair.fromWIF(keystore, TESTNET);
     
     const p2pkh = bitcoin.payments.p2pkh({
        pubkey: keyPair.publicKey,
        network: TESTNET,
      });
   
       
       
     const { address } = p2pkh;
     
     const  destination  = autogenerate.receivePaymentAddress(indexer, passphrase, key); //p2wpkhObj.address;
     console.log(address);
     //const {address} = p2sh;
     let data = await getTransactions(sendFrom, token);
     let confs = data.data.confirmations;
     console.log(confs);
     let balance = data.data.final_balance ;
     console.log("balance : ", data.data.final_balance);
     console.log(balance);
     
     const txref = await fetchUnspents(sendFrom, token);
     const utxos = txref.data.txrefs;
     console.log("UTXOS : " + utxos[0].tx_hash);
     if (confs < 3){
      return errorResponse(401, "Unconfirmed transactions");
    }
     //const totalAmount = balance;
      //const amount = parseFloat(amount);
      console.log(amount)
      let withdrawAmount =  parseInt(amount * 100000000);
      console.log(withdrawAmount);
      let fee = parseInt(0.0001 * 100000000);
      console.log(fee);
     
      
      if (balance < (fee + withdrawAmount)){
       return errorResponse(520, "Insufficient balance");
      }
   
      let change = balance - (withdrawAmount + fee);
     for (const utxo of utxos) {
       const hashHex = await fetchHash(utxo.tx_hash, token);
        psbt.addInput({ 
          hash: utxo.tx_hash, 
          index: utxo.tx_output_n,  
          nonWitnessUtxo : Buffer.from(hashHex.data.hex, 'hex'),
          ///redeemScript: redeemScript
         })
            
     }
      
      psbt.addOutput({
       address: sendTo,
       value: withdrawAmount
      });
      
       psbt.addOutput({ 
       address: destination.address,
       value:  change 
      }); 
   
      psbt.signAllInputs(keyPair);
      console.log('valid signature: ', psbt.validateSignaturesOfAllInputs());
      psbt.finalizeAllInputs()
      const raw_tx = psbt.extractTransaction();
      const rawTx = raw_tx.toHex()
      const tx_hash = raw_tx.getId();
      const txObj = {};
      txObj.from = sendFrom;
      txObj.amount = amount;
      txObj.to = sendTo;
      txObj.index = destination.index;
      txObj.current = destination.address;
      txObj.wif = destination.wif;
      txObj.timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
      txObj.rawTx = rawTx;
      txObj.txHash = tx_hash;
      console.log(tx_hash);
      console.log(rawTx);
      
      
      //implement sendRawTX
      return successResponse(201, txObj, null, 'created')
     } catch (error) {
       console.error('error -> ', logStruct('psbtTransactionBuilder', error))
       return errorResponse(error.status, error.message);
     }
   
    }
   

  const psbtTransactionBuilderCr = async(req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
     }
      try {
        const usr = req.user, adm = req.admin;
        let walletid;
        if (usr){
          walletid = usr.wallet_id;
        }
        else {
          walletid = adm.wallet_id
        }
        
       //sendFrom, keystr, sendTo, amount,  indexer, keyP, passphrase
       const TESTNET = bitcoin.networks.testnet;
       //const saltRounds = 10;
       const psbt = new bitcoin.Psbt({network : TESTNET});
       let auth_btc = {}, pin_set = true;
       const check_pin = await userModel.fetchUserPin(walletid);
       const auth = check_pin[0].pin;
        if (typeof auth === 'undefined' || auth === null || auth == 'null'){
          pin_set = false;
        }
       if (pin_set == true && auth !== 'null' && adm) {
        await authenticatePinAdmin(req, res);
        auth_btc = await authenticateAdmin(req, res);
       }
       if (pin_set == true && auth !== 'null' && usr) {
        await authenticatePin(req, res);
        auth_btc = await authenticateUser(req, res);
       }
   
       let keyWif = CryptoJS.AES.decrypt(auth_btc.btc.wif, pinHash(auth_btc.comb));
       const kyWif = keyWif.toString(CryptoJS.enc.Utf8);
       let keystrl = CryptoJS.AES.decrypt(auth_btc.wallet.mnemonic, pinHash(auth_btc.comb));
       const keystore = keystrl.toString(CryptoJS.enc.Utf8);

       const keyPair = bitcoin.ECPair.fromWIF(kyWif, TESTNET);
       
       const p2pkh = bitcoin.payments.p2pkh({
          pubkey: keyPair.publicKey,
          network: TESTNET,
        });
     
      
       const { address } = p2pkh;
    
       const  destination  = autogenerate.receivePaymentAddress(auth_btc.btc.index, auth_btc.comb , keystore); //p2wpkhObj.address;
      
       console.log(address);
      
       let data = await getTransactions(auth_btc.btc.address, token);
     
     
       let balance = data.data.final_balance ;
       let confs = data.data.unconfirmed_balance;
       console.log("balance : ", data.data.final_balance);
       console.log(balance);
       if (balance < 0){
        return errorResponse(400, "insufficient_btc", {message : "insufficient_btc"});
       }
       
       console.log(confs);
       if (confs > 0){
        //return res.status(400).send("unconfirmed_tx");
        return errorResponse(400, "pending_tx", {message : "unconfirmed_tx"});
      }
       const txref = await fetchUnspents(auth_btc.btc.address, token);
       
       const utxos = txref.data.txrefs;
       console.log("UTXOS : " + utxos[0].tx_hash);
        console.log(req.body.amount)

        let withdrawAmount =  parseInt(req.body.amount * 100000000);
        console.log(withdrawAmount);
        //fetch current fee here

        let fee = parseInt(0.00001 * 100000000);
        console.log(fee);
      
        if (balance < (fee + withdrawAmount)){
         return errorResponse(520, "balance_error", {message : "Insufficient balance"});
        }
     
        let change = balance - (withdrawAmount + fee);
       for (const utxo of utxos) {
         const hashHex = await fetchHash(utxo.tx_hash, token);
          psbt.addInput({ 
            hash: utxo.tx_hash, 
            index: utxo.tx_output_n,  
            nonWitnessUtxo : Buffer.from(hashHex.data.hex, 'hex'),
            
           })
              
       }
        
        psbt.addOutput({
         address: req.body.to,
         value: withdrawAmount
        });
        
         psbt.addOutput({ 
         address: destination.address,
         value:  change 
        }); 
     
        psbt.signAllInputs(keyPair);
        console.log('valid signature: ', psbt.validateSignaturesOfAllInputs());
        psbt.finalizeAllInputs()
        const raw_tx = psbt.extractTransaction();
        const rawTx = raw_tx.toHex()
        const tx_hash = raw_tx.getId();
        //const respPush = await pushRawTransaction(rawTx, token);
        //console.log(respPush.data);
        let txObj = {}, sentObj = {};
        sentObj.wallet_id = walletid;
        sentObj.from = auth_btc.btc.address;
        sentObj.amount = req.body.amount;
        sentObj.to = req.body.to;
        sentObj.index = destination.index;
        sentObj.wif = CryptoJS.AES.encrypt(destination.wif, pinHash(auth_btc.comb)).toString();
        sentObj.address = destination.address;
        sentObj.rawTx = rawTx;
        sentObj.txHash = tx_hash;
        txObj.wallet_id = walletid;
        txObj.address = auth_btc.btc.address;
        txObj.tx_hash = tx_hash;
        txObj.mode = 'btc';
        txObj.type = 'credit';
        txObj.to = req.body.to;
        txObj.value = withdrawAmount;
        let getBtcPrice = await checkBtcPrice();
        let btc_price = getBtcPrice.data;
        console.log(btc_price);
        let _pr = btc_price.toFixed(2);
        console.log(_pr);
        let _usd = (withdrawAmount/100000000) * _pr;
        let _sum = _usd.toFixed(2);
        console.log(_sum);
        txObj.fiat = _sum;
        let _change = (change/100000000) * _pr;
        let change_ = _change.toFixed(2);
        console.log(change_);
        //txObj.timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
        
        
        console.log(tx_hash);
        console.log(rawTx);
        
        await walletModel.btcSentTxs(sentObj);

       /** if (auth_btc.btc.index > 0 && auth_btc.btc.index !== 'null'){
          let rec_wif = {
            wallet_id : req.body.wallet_id,
            address : destination.address,
            wif : txObj.wif,
            index : destination.index
          }
        await walletModel.createWif(rec_wif);
        } **/
        //txObj.address = from;
        await transactions.createTransaction(txObj);
        //txObj.address = from;
        txObj.type = 'debit';
        txObj.tx_hash = auth_btc.btc.address;
        txObj.to = destination.address;
        txObj.value = change;
        txObj.fiat = change_;
        await transactions.createTransaction(txObj);
        //const decTx = await decodeRawTransaction(JSON.stringify(sentObj.rawTx), token);
        //console.log(decTx);
        return successResponse(201, sentObj, {txHash : tx_hash}, 'btc sent');
        //implement sendRawTX
        
       } catch (error) {
         console.error('error -> ', logStruct('psbtTransactionBuilderCr', error))
         return errorResponse(error.status, error.message);
       }
     
      }


  const psbtTransactionProd = async(sendFrom, keystore, sendTo, amount,  indexer, key, passphrase) => {
  try {
   const TESTNET = bitcoin.networks.testnet;
   const psbt = new bitcoin.Psbt({network : MAINNET})
   const keyPair = bitcoin.ECPair.fromWIF(keystore, MAINNET);
   
   const p2pkh = bitcoin.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: MAINNET,
    });
 
   //const p2sh = bitcoin.payments.p2sh({ redeem: bitcoin.payments.p2pkh({pubkey: keyPair.publicKey , network: TESTNET}), network: TESTNET});
       //const p2wpkhObj = bitcoin.payments.p2wpkh({pubkey: keyPair.publicKey , network: TESTNET});
      /**  const p2shObj = bitcoin.payments.p2sh({
         redeem: p2wpkh, 
         network : TESTNET
      })**/
     
     
   const { address } = p2pkh;
   
   const  destination  = autogenerate.newP2PKHAddressMain(indexer, xPubKey); //p2wpkhObj.address;
   //const redeemScript = p2sh.redeem.output;
   console.log(address);
   //const {address} = p2sh;
   let data = await getTransactions(sendFrom, token);
 
   let balance = data.data.final_balance ;
   console.log("balance : ", data.data.final_balance);
   console.log(balance);
   
   const txref = await fetchUnspents(sendFrom, token);
   const utxos = txref.data.txrefs;
   console.log("UTXOS : " + utxos[0].tx_hash);
   //const totalAmount = balance;
    //const amount = parseFloat(amount);
    console.log(amount)
    let withdrawAmount =  parseInt(amount * 100000000);
    console.log(withdrawAmount);
    let fee = parseInt(0.001 * 100000000);
    console.log(fee);
   
    
    if (balance < (fee + withdrawAmount)){
     return errorResponse(520, "Insufficient balance");
    }
 
    let change = balance - (withdrawAmount + fee);
   for (const utxo of utxos) {
     const hashHex = await fetchHash(utxo.tx_hash, token);
      psbt.addInput({ 
        hash: utxo.tx_hash, 
        index: utxo.tx_output_n,  
        nonWitnessUtxo : Buffer.from(hashHex.data.hex, 'hex'),
        ///redeemScript: redeemScript
       })
          
   }
    
    psbt.addOutput({
     address: sendTo,
     value: withdrawAmount
    });
    
     psbt.addOutput({ 
     address: destination.address,
     value:  change 
    }); 
 
    psbt.signAllInputs(keyPair);
    console.log('valid signature: ', psbt.validateSignaturesOfAllInputs());
    psbt.finalizeAllInputs()
    const raw_tx = psbt.extractTransaction();
    const rawTx = raw_tx.toHex()
    const tx_hash = raw_tx.getId();
    const txObj = {};
    txObj.from = sendFrom;
    txObj.amount = amount;
    txObj.to = sendTo;
    txObj.index = destination.index;
    txObj.current = destination.address;
    txObj.wif = CryptoJS.AES.encrypt(destination.wif, passphrase).toString();
    txObj.timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    txObj.rawTx = rawTx;
    txObj.txHash = tx_hash;
    console.log(tx_hash);
    console.log(rawTx);
    
    
    //implement sendRawTX
    return successResponse(201, txObj, null, 'created')
   } catch (error) {
     console.error('error -> ', logStruct('psbtTransactionProd', error))
     return errorResponse(error.status, error.message);
   }
 
  }

const psbtTransactionBuild = async(sendFrom, keystore, sendTo, amount, indexer, xPubKey) => {
try {
const TESTNET = bitcoin.networks.testnet;
const psbt = new bitcoin.Psbt({network : TESTNET})
const keyPair = bitcoin.ECPair.fromWIF(keystore, TESTNET);
//const p2sh = bitcoin.payments.p2sh({ redeem: bitcoin.payments.p2wpkh({pubkey: keyPair.publicKey , network: TESTNET}), network: TESTNET});
const p2wpkh = bitcoin.payments.p2wpkh({pubkey: keyPair.publicKey , network: TESTNET});
  
const dest = autogenerate.newP2WPKHAddress(indexer, xPubKey);
console.log(dest);

let data = await getTransactions(sendFrom, token);

let balance = data.data.final_balance;
console.log("balance : ", data.data.final_balance);
console.log(balance);

const txref = await fetchUnspents(sendFrom, token);
const utxos = txref.data.txrefs; //ghp_AqUwW4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VMNCqvT4vNsF5l4U4q4uOrZT3LZlba
console.log("UTXOS : " + utxos[0].tx_hash);

 console.log(amount)
 let withdrawAmount =  parseInt(amount * 100000000);
 console.log(withdrawAmount);
 let fee = parseInt(0.001 * 100000000);
 console.log(fee);

 
 if (balance < (fee + withdrawAmount)){
  return errorResponse(520, "Insufficient balance");
 }

 let change = balance - (withdrawAmount + fee);



for (const utxo of utxos) {
  const hashHex = await fetchHash(utxo.tx_hash, token);
  console.log(hashHex.data)

   psbt.addInput({ 
     hash: utxo.tx_hash, 
     index: utxo.tx_output_n,
     nonWitnessUtxo: Buffer.from(hashHex.data.hex, 'hex'),
    /** witnessUtxo:  {
      script: p2sh.output,
      value: utxo.value,
     }, **/
     //redeemScript: p2wpkh.output
    })   
}
 
psbt.addOutput({
  address: sendTo,
  value: withdrawAmount
 });

 psbt.addOutput({ 
  address: dest.address,
  value:  change 
 });

 psbt.signAllInputs(keyPair);
 console.log('valid signature: ', psbt.validateSignaturesOfAllInputs());
 psbt.finalizeAllInputs()
 const raw_tx = psbt.extractTransaction();
 const rawTx = raw_tx.toHex()
 const tx_hash = raw_tx.getId();
 const txObj = {};
 txObj.from = sendFrom;
 txObj.amount = amount;
 txObj.to = sendTo;
 txObj.index = dest.index;
 txObj.current = dest.address;
 txObj.timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
 txObj.rawTx = rawTx;
 txObj.txHash = tx_hash;
 console.log(tx_hash);
 console.log(rawTx);
 
 //implement sendRawTX
 return successResponse(201, txObj, null, 'created')
} catch (error) {
  console.error('error -> ', logStruct('psbtTransactionBuild', error))
  return errorResponse(error.status, error.message);
}
}

const psbtTransactionBuildMain = async(sendFrom, keystore, key, sendTo, amount, indexer, passphrase) => {
  try {
  const MAINNET = bitcoin.networks.bitcoin;
  const psbt = new bitcoin.Psbt({network : MAINNET})
  //const key_Pair = bitcoin.ECPair.fromWIF(keystore, MAINNET);
  //const keyPair = bip32.fromBase58(keystore, MAINNET);
  //const wifKey = keyPair.derivePath(indexer).toWIF();
  const keyPair = bitcoin.ECPair.fromWIF(keystore, MAINNET);
  //const p2sh = bitcoin.payments.p2sh({ redeem: bitcoin.payments.p2wpkh({pubkey: keyPair.publicKey , network: TESTNET}), network: TESTNET});
  const p2pkh = bitcoin.payments.p2pkh({pubkey: keyPair.publicKey , network: MAINNET});
  const { address } = p2pkh;

  console.log(address);
  const dest = autogenerate.receivePaymentAddressMain(indexer, passphrase, key);
  console.log(dest);
  
  let data = await getTransactionsMain(sendFrom, token);
  
  let balance = data.data.final_balance;
  console.log("balance : ", data.data.final_balance);
  console.log(balance);
  
  const txref = await fetchUnspentsMain(sendFrom, token);
  const utxos = txref.data.txrefs;
  console.log("UTXOS : " + utxos[0].tx_hash);
  
   console.log(amount)
   let withdrawAmount =  parseInt(amount * 100000000);
   console.log(withdrawAmount);
   let fee = parseInt(amount * 0.1 * 100000000);
   console.log(fee);
  
   
   if (balance < (fee + withdrawAmount)){
    return errorResponse(520, "Insufficient balance");
   }
  
   let change = balance - (withdrawAmount + fee);
  
  
  
  for (const utxo of utxos) {
    const hashHex = await fetchHashMain(utxo.tx_hash, token);
    console.log(hashHex.data)
  
     psbt.addInput({ 
       hash: utxo.tx_hash, 
       index: utxo.tx_output_n,
       nonWitnessUtxo: Buffer.from(hashHex.data.hex, 'hex'),
      /** witnessUtxo:  {
        script: p2sh.output,
        value: utxo.value,
       }, **/
       //redeemScript: p2wpkh.output
      })   
  }
   
  psbt.addOutput({
    address: sendTo,
    value: withdrawAmount
   });
  
   psbt.addOutput({ 
    address: dest.address,
    value:  change 
   });
  
   psbt.signAllInputs(keyPair);
   console.log('valid signature: ', psbt.validateSignaturesOfAllInputs());
   psbt.finalizeAllInputs()
   const raw_tx = psbt.extractTransaction();
   const rawTx = raw_tx.toHex()
   const tx_hash = raw_tx.getId();
   const txObj = {};
   txObj.from = sendFrom;
   txObj.amount = amount;
   txObj.to = sendTo;
   txObj.index = dest.index;
   txObj.current = dest.address;
   txObj.wif = dest.wif;
   txObj.timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
   txObj.rawTx = rawTx;
   txObj.txHash = tx_hash;
   console.log(tx_hash);
   console.log(rawTx);
   
   //implement sendRawTX
   return successResponse(201, txObj, null, 'btc sent')
  } catch (error) {
    console.error('error -> ', logStruct('psbtTransactionBuildMain', error))
    return errorResponse(error.status, error.message);
  }
  }

 const calculatePrices = async (req, res) => {
  const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
     }
  try {
    const admn = req.admin, usr = req.user;
    let _wallet_id;
    if (usr){
      _wallet_id = usr.wallet_id;
    }
    else{
      _wallet_id = admn.wallet_id;
    }
     const userAddress = await walletModel.checkBTC(_wallet_id);
     const response = await getTransactions(userAddress[0].address, token);
     let bal = {};
     bal.wallet_id = _wallet_id;
     bal.crypto = "btc";
     bal.address = userAddress[0].address;
     let unconfirmed = response.data.unconfirmed_balance;
     if (unconfirmed && unconfirmed > 0 ){
      let uncf = (unconfirmed/100000000);
      console.log(uncf);
      bal.status = "pending";
      bal.balance = uncf;
      bal.usd = 0;
     }
     else {
     let final = response.data.final_balance;
     if (final && final > 0 ){
     let fn = (final/100000000);
     console.log(fn);
     bal.balance = fn;
     let getPrice = await checkBtcPrice();
     let btc_prc = getPrice.data;
     console.log(btc_prc);
     let pr = btc_prc.toFixed(2);
     console.log(pr);
     let usd = fn * pr;
     let sum = usd.toFixed(2);
     console.log(sum);
     bal.usd = sum;
     //req.user.btc = fn;
     // req.user.usd = sum;
     }
    }
     await walletModel.updateBalance(bal);
    return successResponse(200, bal, {address : bal.address, btc_balance : bal.balance, usd_balance : bal.usd})
  } catch (error) {
    console.error('error -> ', logStruct('calculatePrices', error))
    return errorResponse(error.status, error.message);
  }
 }


  
 router.get('/test/balance', validateToken, async(req, res, next) => {
     const respBal = await calculatePrices(req, res);
     return res.status(respBal.status).send(respBal.data)
 });

 router.get('/admin/balance', validateAdmin, async(req, res, next) => {
     const respBal = await calculatePrices(req, res);
     return res.status(respBal.status).send(respBal.data)
 });

 router.post('/main/balance', validateToken, async(req, res, next) => {
   
  const address = req.body.address;

  const response = await getTransactionsMain(address, token);
  let final = response.data.final_balance;
  let data = {}
  data.address = address;
  data.balance = (final/100000000);
  data.timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
  return res.status(response.status).send(data)

})

 router.post('/test/sendBTC', validateToken, async(req, res, next) => {
  const {from, keystore, to, amount, index, key, passphrase} = req.body
  const response = await psbtTransactionBuilder(from, keystore, to, amount, index, key, passphrase);
  return res.status(response.status).send(response.data)
 });
 
 router.post('/test/sendBTC/cr', validateToken, [
  check('amount', 'Please include a amount').isInt().not().isEmpty(),
  check('passphrase', 'Please include a passphrase').isNumeric().not().isEmpty(),
], async(req, res, next) => {
  req.body.to = config.ESCROW_BTC;//"mnxW3nw6AVfAXE55vsoMkyGEGmB9KnWm4N";
  //req.body.passphrase = req.body.pin;
  const response = await psbtTransactionBuilderCr(req, res);
  
  return res.status(response.status).send(response.data)
 });

 router.post('/test/sendBTC/addr', validateToken, [
  check('amount', 'Please include a amount').isInt().not().isEmpty(),
  check('passphrase', 'Please include a passphrase').isNumeric().not().isEmpty(),
  check('to', 'Please include a destination address').isBtcAddress().not().isEmpty(),
], async(req, res, next) => {
  const response = await psbtTransactionBuilderCr(req, res);
  
  return res.status(response.status).send(response.data)
 });

 router.post('/test/sendBTC/admin', validateAdmin, [
  check('amount', 'Please include a amount').isInt().not().isEmpty(),
  check('pin', 'Please include a pin').isNumeric().not().isEmpty(),
  check('to', 'Please include a destination address').isBtcAddress().not().isEmpty(),
], async(req, res, next) => {
  const response = await psbtTransactionBuilderCr(req, res);
  
  return res.status(response.status).send(response.data)
 });

 router.post('/main/sendBTC', validateToken, async(req, res, next) => {
  const {from, keystore,  key,  to, amount, index, xPub} = req.body
  const response = await psbtTransactionProd(from, keystore, key, to, amount, index, xPub);
  return res.status(response.status).send(response.data)
 });
 
 router.post('/main/send', validateToken, async(req, res, next) => {
  const {from, keystore,  key,  to, amount, index, passphrase} = req.body
  const response = await psbtTransactionBuildMain(from, keystore, key, to, amount, index, passphrase);
  return res.status(response.status).send(response.data)
 });


 router.post('/test/send', validateToken, async(req, res, next) => {
  const {from, keystore, to, amount, index, xPub} = req.body
  const response = await psbtTransactionBuild(from, keystore, to, amount, index, xPub);
  return res.status(response.status).send(response.data)
});

 router.post('/test/decode/cr', validateToken, async(req, res, next) => {
  let walletid = await walletModel.fetchSentPending({wallet_id : req.user.wallet_id, rawTx : req.body.tx});
  if (!walletid && !walletid.length) {
    return res.status(403).json({ msg : 'transcationNotExists' });
  }
  if (walletid[0].wallet_id !== req.user.wallet_id) {
    return res.status(403).json({ msg : 'user wallet id mismatch' });
  }
  const tx = JSON.stringify(req.body);
  const response = await decodeRawTransaction(tx, token);
  await walletModel.updateBtcSent({wallet_id : req.user.wallet_id, rawTx : req.body.tx, status : "decoded"});
  return res.status(response.status).send(response.data);
});

router.post('/test/decode/admin', validateAdmin, async(req, res, next) => {
  let walletid = await walletModel.fetchSentPending({wallet_id : req.admin.wallet_id, rawTx : req.body.tx});
  if (!walletid && !walletid.length) {
    return res.status(403).json({ msg : 'transcationNotExists' });
  }
  if (walletid[0].wallet_id !== req.admin.wallet_id) {
    return res.status(403).json({ msg : 'user wallet id mismatch' });
  }
  const tx = JSON.stringify(req.body);
  const response = await decodeRawTransaction(tx, token);
  await walletModel.updateBtcSent({wallet_id : req.admin.wallet_id, rawTx : req.body.tx, status : "decoded"});
  return res.status(response.status).send(response.data);
});

router.post('/main/decode', validateToken, async(req, res, next) => {
  const tx = JSON.stringify(req.body);
  const response = await decodeRawTransactionMain(tx, token);
  return res.status(response.status).send(response.data)
});

router.post('/test/push', validateToken, async(req, res, next) => {
  const tx = JSON.stringify(req.body);
  const response = await pushRawTransaction(tx, token);
  return res.status(response.status).send(response.data)
});


router.post('/test/push/cr', validateToken, async(req, res, next) => {
  let walletid = await walletModel.fetchSentDecoded({wallet_id : req.user.wallet_id, rawTx : req.body.tx});
  if (!walletid && !walletid.length) {
    return res.status(403).json({ msg : 'transcationNotExists' });
  }
  if (walletid[0].wallet_id !== req.user.wallet_id) {
    return res.status(403).json({ msg : 'user wallet id mismatch' });
  }
  const tx = JSON.stringify(req.body);
  const response = await pushRawTransactionCr(tx, token);
  await walletModel.updateBtcSent({wallet_id : req.user.wallet_id, rawTx : req.body.tx, status : "pushed"});
  let sent_wif = await walletModel.fetchSentBtc({wallet_id : req.user.wallet_id, rawTx : req.body.tx});
  let rec_wif = {
    wallet_id : req.user.wallet_id,
    address : sent_wif[0].address,
    wif : sent_wif[0].wif,
    index : sent_wif[0].index
  }
  await walletModel.createWif(rec_wif);
  await walletModel.updateBTC(rec_wif);
  return res.status(response.status).send(response.data)
});

router.post('/test/push/admin', validateAdmin, async(req, res, next) => {
  let walletid = await walletModel.fetchSentDecoded({wallet_id : req.admin.wallet_id, rawTx : req.body.tx});
  if (!walletid && !walletid.length) {
    return res.status(403).json({ msg : 'transcationNotExists' });
  }
  if (walletid[0].wallet_id !== req.admin.wallet_id) {
    return res.status(403).json({ msg : 'user wallet id mismatch' });
  }
  const tx = JSON.stringify(req.body);
  const response = await pushRawTransactionCr(tx, token);
  await walletModel.updateBtcSent({wallet_id : req.admin.wallet_id, rawTx : req.body.tx, status : "pushed"});
  let sent_wif = await walletModel.fetchSentBtc({wallet_id : req.admin.wallet_id, rawTx : req.body.tx});
  let rec_wif = {
    wallet_id : req.admin.wallet_id,
    address : sent_wif[0].address,
    wif : sent_wif[0].wif,
    index : sent_wif[0].index
  }
  await walletModel.createWif(rec_wif);
  await walletModel.updateBTC(rec_wif);
  return res.status(response.status).send(response.data)
});

router.post('/main/pushBTC', validateToken, async(req, res, next) => {
  const tx = JSON.stringify(req.body);
  const response = await pushRawTransactionMain(tx, token);
  return res.status(response.status).send(response.data)
});

const convertUSDToBTC = async(amount) => {
  let btc_price = await checkBtcPrice();
  let usd_price = btc_price.data.toFixed(2);
  let usd_amount = parseFloat(amount);
  let btc_amount = usd_amount/usd_price;
  btc_amount = btc_amount.toFixed(6);
  return btc_amount;
}

router.get('/rate', [
  check('amount', 'Usd amount is required').isNumeric().not().isEmpty()
], async(req, res, next) => {
  const rate = await convertUSDToBTC(req.body.amount);
  return res.status(200).json({rate : rate});
});



router.post('/test/utxos', validateToken, async(req, res, next) => {
  const address = req.body.address;
  const response = await fetchUnspents(address, token);
  return res.status(response.status).send(response.data);
});

router.post('/test/data', validateToken, async(req, res, next) => {
  const hash = req.body.hash;
  const response = await fetchHash(hash, token);
  return res.status(response.status).send(response.data);
});

router.post('/main/utxos', validateToken, async(req, res, next) => {
  const address = req.body.address;
  const response = await fetchUnspentsMain(address, token);
  return res.status(response.status).send(response.data);
});

//psbtTransactionBuildMain()

module.exports = router;