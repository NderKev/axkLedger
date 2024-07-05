
   const bitcoin = require('bitcoinjs-lib');
   const bip32 = require('bip32')
   const bip39 = require('bip39')
   const axios = require('axios');
   require('dotenv').config();
   const moment = require('moment');
   const express = require('express');
   const autogenerate = require("./autogenerate");
   const cmp_token = process.env.COIN_MARKET_CAP;
   const mainnet = process.env.MAINNET_URL;
   const router  = express.Router();
   const {successResponse, errorResponse} = require('./lib/response');
   const CryptoJS = require("crypto-js");
   const bcrypt = require('bcryptjs');
   const pinHash = require('sha256');
   const { bindAll } = require('lodash');
   const logStruct = (func, error) => {
    return {'func': func, 'file': 'relayBTC', error}
  }
  
   
   let test_api = process.env.TESTNET_API;
   let test_tx = process.env.TESTNET_TX;
   let main_tx = process.env.MAINNET_TX;
  // let token = process.env.TOKEN;
   let decode = process.env.TESTNET_DECODE;
   let push = process.env.TESTNET_PUSH;
   let decodemain = process.env.MAINNET_DECODE;
   let pushmain = process.env.MAINNET_PUSH;
   let token = process.env.BLOCKCIPHER_TOKEN;
   

   
   const decodeRawTransaction = async(rawTx, token)=>{
     try {
       //const tx = JSON.stringify(rawTx);
       let decode_url = `${decode}?token=${token}`
       const config = {
        method : 'post',
        url : decode_url,
        headers: { },
        data : rawTx
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
   

    const psbtTransactionBuilderCr = async(reqData) => {
      try {
       
       //sendFrom, keystr, sendTo, amount,  indexer, keyP, passphrase
       const TESTNET = bitcoin.networks.testnet;
      
       const psbt = new bitcoin.Psbt({network : TESTNET});
       const keyPair = bitcoin.ECPair.fromWIF(reqData.keystore, TESTNET);
       
       const p2pkh = bitcoin.payments.p2pkh({
          pubkey: keyPair.publicKey,
          network: TESTNET,
        });
     
      
       const { address } = p2pkh;
    
       const  destination  = autogenerate.receivePaymentAddress(reqData.prevIndex, reqData.passkey , reqData.keystore); //p2wpkhObj.address;
       //const redeemScript = p2sh.redeem.output;
       console.log(address);
       //const {address} = p2sh;
       let data = await getTransactions(reqData.from, token);
      // console.log(data);
      // console.log(data.data);
     
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
       const txref = await fetchUnspents(reqData.from, token);
       
       const utxos = txref.data.txrefs;
       console.log("UTXOS : " + utxos[0].tx_hash);
       //const totalAmount = balance;
        //const amount = parseFloat(amount);
        console.log(reqData.amount)
        l
        let withdrawAmount =  parseInt(reqData.amount * 100000000);
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
         address: reqData.to,
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
        const txObj = {};
        txObj.user_id = reqData.user_id;
        txObj.from = reqData.from;
        txObj.amount = kes_btc;
        txObj.to = reqData.to;
        txObj.index = destination.index;
        txObj.current = destination.address;
        txObj.wif = CryptoJS.AES.encrypt(destination.wif, comb).toString();
        //txObj.timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
        txObj.rawTx = rawTx;
        txObj.txHash = tx_hash;
        console.log(tx_hash);
        console.log(rawTx);
       
    
        return successResponse(201, txObj, {txHash : tx_hash}, 'btc sent');
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

 const calculatePrices = async (data) => {
  try {
     const response = await getTransactions(data.address, token);
     let final = response.data.final_balance;
     let fn = (final/100000000);
     console.log(fn);
     let bal = {}
     bal.user_id = data.user_id;
     bal.crypto = "btc"
     bal.current = data.address;
     bal.balance = fn;
     let getPrice = await checkBtcPrice();
     let btc_prc = getPrice.data;
     console.log(btc_prc);
     let pr = btc_prc.toFixed(2);
     console.log(pr);
     let usd = fn * pr;
     let sum = usd.toFixed(2);
     console.log(sum);
     let tF = sum  * 110;
     tF = tF.toFixed(2);
     console.log(tF);
     bal.kes = tF;
   
    return successResponse(200, bal, {wallet_id: bal.current, btc_balance : bal.balance, kes_balance : bal.kes})
  } catch (error) {
    console.error('error -> ', logStruct('calculatePrices', error))
    return errorResponse(error.status, error.message);
  }
 }


  
 router.post('/test/balance',  async(req, res, next) => {
     const em = req.body.email;
     const user_id = req.body.user_id;
     //req.body.user_id = req.session.user_id;
     //req.body.address = req.session.wallet_id;
     const respBal = await calculatePrices(req.body);
   return res.status(respBal.status).send(respBal.data)
 })

 router.post('/main/balance', async(req, res, next) => {
   
  const address = req.body.address;

  const response = await getTransactionsMain(address, token);
  let final = response.data.final_balance;
  let data = {}
  data.address = address;
  data.balance = (final/100000000);
  data.timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
  return res.status(response.status).send(data)

})

 router.post('/test/sendBTC', async(req, res, next) => {
  const {from, keystore, to, amount, index, key, passphrase} = req.body
  const response = await psbtTransactionBuilder(from, keystore, to, amount, index, key, passphrase);
  return res.status(response.status).send(response.data)
 });
 
 router.post('/test/sendBTC/cr',  async(req, res, next) => {
  req.body.to = process.env.ESCROW_ACCOUNT_BTC;//"mnxW3nw6AVfAXE55vsoMkyGEGmB9KnWm4N";
  //req.body.passphrase = req.body.pin;
  const response = await psbtTransactionBuilderCr(req.body);
  
  if (response.success && response.meta){
    req.session.txHash = response.meta.txHash;
  }

  return res.status(response.status).send(response.data)
 });

 router.post('/main/sendBTC', async(req, res, next) => {
  const {from, keystore,  key,  to, amount, index, xPub} = req.body
  const response = await psbtTransactionProd(from, keystore, key, to, amount, index, xPub);
  return res.status(response.status).send(response.data)
 });
 
 router.post('/main/send', async(req, res, next) => {
  const {from, keystore,  key,  to, amount, index, passphrase} = req.body
  const response = await psbtTransactionBuildMain(from, keystore, key, to, amount, index, passphrase);
  return res.status(response.status).send(response.data)
 });


 router.post('/test/send', async(req, res, next) => {
  const {from, keystore, to, amount, index, xPub} = req.body
  const response = await psbtTransactionBuild(from, keystore, to, amount, index, xPub);
  return res.status(response.status).send(response.data)
});

 router.post('/test/decode', async(req, res, next) => {
  const tx = JSON.stringify(req.body);
  const response = await decodeRawTransaction(tx, token);
  return res.status(response.status).send(response.data)
});

router.post('/main/decode', async(req, res, next) => {
  const tx = JSON.stringify(req.body);
  const response = await decodeRawTransactionMain(tx, token);
  return res.status(response.status).send(response.data)
});

router.post('/test/push', async(req, res, next) => {
  const tx = JSON.stringify(req.body);
  const response = await pushRawTransaction(tx, token);
  return res.status(response.status).send(response.data)
});


router.post('/test/push/cr',  async(req, res, next) => {
  const tx = JSON.stringify(req.body);
  
  const response = await pushRawTransactionCr(tx, token);
  return res.status(response.status).send(response.data)
});



router.post('/main/pushBTC', async(req, res, next) => {
  const tx = JSON.stringify(req.body);
  const response = await pushRawTransactionMain(tx, token);
  return res.status(response.status).send(response.data)
});


router.post('/test/utxos',  async(req, res, next) => {
  const address = req.body.address;
  const response = await fetchUnspents(address, token);
  return res.status(response.status).send(response.data);
});

router.post('/test/data',  async(req, res, next) => {
  const hash = req.body.hash;
  const response = await fetchHash(hash, token);
  return res.status(response.status).send(response.data);
});

router.post('/main/utxos', async(req, res, next) => {
  const address = req.body.address;
  const response = await fetchUnspentsMain(address, token);
  return res.status(response.status).send(response.data);
});

//psbtTransactionBuildMain()

module.exports = router;