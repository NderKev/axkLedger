const axios = require('axios');
//require('dotenv').config();
const moment = require('moment');
const express = require('express');
const router  = express.Router();
//let test_tx = config.TESTNET_TX;
const {successResponse, errorResponse} = require('./lib/response');
const config = require('../config');
const logStruct = (func, error) => {
 return {'func': func, 'file': 'Deposit', error}
}

let token = config.BLOCKCIPHER_TOKEN;
let transaction = "https://api.blockcypher.com/v1/btc/test3/txs"
let mainnet = config.MAINNET_URL;
let main_tx = config.MAINNET_TX;
let test_api = config.TESTNET_API;

const checkValidDeposit = async (data) => {
  try {
     
      const resData = await checkDepositedBTC(data.txHash, token, data.address, data.amount, data.user_id);
      
      if (resData.data.status == 'pending' || resData.data.status == 'complete'){
      const pkgData = {
        ref : resData.data.to,
        user_id : data.user_id,
        amount: data.amount,
        mode : 'btc',
        txHash : data.txHash,
        desc : resData.data.address,
        status : "pending"
      }
      
      let btc_amount = (resData.data.amount * 100000000);
      
      let txBtc = {
        ref : resData.data.to,
        user_id : data.user_id,
        amount : btc_amount,
        mode : 'btc',
        type : 'in',
        txHash : data.txHash,
        status : "pending",
        desc : resData.data.address
      }
    }
    return  successResponse(200, resData.data); 
  } catch(error){
  console.error('error -> ', logStruct('checkValidDeposit', error))
  return errorResponse(error.status, error.message);
 }
}

const transactionStatus = async(hash, token)=>{
  try {
    //const tx = JSON.stringify(rawTx);
    let transact_url = `${transaction}/${hash}?token=${token}`
    const config = {
     method : 'get',
     url : transact_url,
     headers: { },
     //data : ""
   }
    let response = await axios(config);
    return  successResponse(200, response.data);
  } catch(error){
   console.error('error -> ', logStruct('transactionStatus', error))
   return errorResponse(error.status, error.message);
 }
}


router.post('/rec/tx/in',  async(req, res, next) => {
    let {hash, amount, address, user_id} = req.body;
    //amount = await convertToBTC(amount);
 
    let status = await checkDepositedBTC(hash, token, address, amount, user_id);
 
    return res.status(status.status).send(status.data);
  })

  const checkDepositedBTC = async(hash, token, address, sent, id) => {
    try {

      let tx_data = await transactionStatus(hash, token);
      if (tx_data.success && tx_data.data){
      console.log(tx_data.data);
      const addresses = tx_data.data.addresses;
      console.log(addresses);
      const conf = tx_data.data.confirmations;
      console.log(conf);
      const ln = addresses.length-1;
      let received = sent * 100000000;
      let inc_tx = {};
      let utxos;
      let exists = false;
      //let txref = [];
      
          for (let addr = 0; addr < addresses.length; addr++) {
            if (addresses[addr] == address) {
             exists = true;
             //address = addresses[addr];
            }
        }

        if (exists == false){
          return errorResponse(401, "invalid", {message : "invalid_tx"});
        }

        let txref = await fetchUnspents(address, token);
        if (conf <= 0){
          utxos = txref.data.unconfirmed_txrefs;
         }
         else {
           utxos = txref.data.txrefs;
         }
       console.log(utxos.length);
       for (let idx = 0; idx < utxos.length; idx++){
          // for(const utxo of utxos) {
            let txhash = utxos[idx].tx_hash;
            console.log(txhash)
            let value = utxos[idx].value
            let confs = utxos[idx].confirmations
            if (txhash == hash && value == received &&  confs < 3) {
            inc_tx.txHash = txhash;
            inc_tx.address = addresses[ln];
            inc_tx.to = address;
            inc_tx.amount = (value/100000000);
            inc_tx.status = "pending"
            return  successResponse(200, inc_tx);
            }
           if (txhash == hash && value == received && confs >= 3)
            {
              inc_tx.txHash = txhash;
              inc_tx.address = addresses[ln];
              inc_tx.to = address;
              inc_tx.amount = (value/100000000);
              inc_tx.status = "complete"
             return  successResponse(200, inc_tx);
            }
           if (idx == utxos.length - 1){
              inc_tx.txHash = txhash;
              inc_tx.address = addresses[ln];
              inc_tx.to = address;
              inc_tx.amount = (value/100000000);
              inc_tx.status = "invalid";
              return  successResponse(200, inc_tx);
           }
        }  
    }
    } catch(error){
     console.error('error -> ', logStruct('checkDepositedBTC', error))
     return errorResponse(error.status, error.message);
   }
  }

  const fetchUnspents = async(address, token) => { 
    try {
      const unspents = await axios(`${test_api}/${address}?unspentOnly=true?token=${token}`);
      //console.log(JSON.stringify(unspents.data));
      return   successResponse(200, unspents.data)
  } catch(error){
      console.error('error -> ', logStruct('fetchUnspents', error))
      return errorResponse(error.status, error.message);
  }
  }

  const convertToBTC = async(amount) => {
    let btc_price = await transactionController.checkBtcPrice();
    let usd_price = btc_price.data.toFixed(2);
    let kes_price = usd_price * 110;
    kes_price = kes_price.toFixed(2);
    let btc_amount = amount/kes_price;
    btc_amount = btc_amount.toFixed(6);
    return btc_amount;
  }

  router.post('/test/tx/in',  async(req, res, next) => {
    let {hash, amount, address, user_id} = req.body;
    //amount = await convertToBTC(amount);
    let data = {};
    
    let reqData = {
      txHash : hash,
      address : address,
      amount : amount,
      user_id : user_id
    }
    
    let status = await checkValidDeposit(reqData);
    return res.status(status.status).send(status.data);
  })

  module.exports = router;