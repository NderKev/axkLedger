const axios = require('axios');
require('dotenv').config();
//const moment = require('moment');
const express = require('express');
const router  = express.Router();
//const relayJs = require('./relayBTC');
const config = require('../config');
const {successResponse, errorResponse} = require('./lib/response');
const logStruct = (func, error) => {
 return {'func': func, 'file': 'checkStatus', error}
}

let transaction = "https://api.blockcypher.com/v1/btc/test3/txs"
let mainnet = config.MAINNET_URL;
let main_tx = config.MAINNET_TX;
let test_api = config.TESTNET_API;


let token = config.BLOCKCIPHER_TOKEN;

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

  router.post('/test', async(req, res, next) => {
      let hash = req.body.hash;
      let status = await transactionStatus(hash, token);
      return res.status(status.status).send(status.data);
  })
  
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
  
  const checkIncomingBTC = async(hash, token, address, sent) => {
    try {
      let tx_data = await transactionStatus(hash, token);
      if (tx_data.success && tx_data.data){
      console.log(tx_data.data);
      const addresses = tx_data.data.addresses;
      console.log(addresses);
      //const amount = tx_data.data.total;
      //const outputs = tx_data.data.outputs;
     // const inputs = tx_data.data.inputs;
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
        
       //console.log(utxos);
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
        
/***
          utxos.forEach((element, ind) => {
            if(element.tx_hash == hash && element.value == received && element.confirmations < 3){
            inc_tx.txHash = element.tx_hash;
            inc_tx.address = addresses[ln];
            inc_tx.to = address;
            inc_tx.amount = (element.value/100000000);
            inc_tx.status = "pending"
            return  successResponse(200, inc_tx);
            }
            if (element.tx_hash == hash && element.value == received && element.confirmations >= 3){
              inc_tx.txHash = element.tx_hash;
              inc_tx.address = addresses[ln];
              inc_tx.to = address;
              inc_tx.amount = (element.value/100000000);
              inc_tx.status = "complete"
             return  successResponse(200, inc_tx);
            }
              inc_tx.txHash = element.tx_hash;
              inc_tx.address = addresses[ln];
              inc_tx.to = address;
              inc_tx.amount = (element.value/100000000);
              inc_tx.status = "invalid";
              return  successResponse(200, inc_tx);
          }); **/
        
    }
    } catch(error){
     console.error('error -> ', logStruct('checkIncomingBTC', error))
     return errorResponse(error.status, error.message);
   }
  }
  

 const checkValidTx = async (data) => {
  try {
      
      const resData = await checkIncomingBTC(data.txHash, token, data.address, data.amount);
      
    return  successResponse(200, resData.data); 
  } catch(error){
  console.error('error -> ', logStruct('checkValidTx', error))
  return errorResponse(error.status, error.message);
 }
}


router.post('/test/record/ext',  async(req, res, next) => {
  //req.body.user_id = req.session.user_id;

  req.body.address = config.ESCROW_ACCOUNT_BTC; //"mnxW3nw6AVfAXE55vsoMkyGEGmB9KnWm4N";
  let status = await checkValidTx(req.body);
  return res.status(status.status).send(status.data);
})


router.post('/test/withdraw/ext',  async(req, res, next) => {
  //req.body.user_id = req.session.user_id;
  req.body.address = config.ESCROW_ACCOUNT_BTC;//"mnxW3nw6AVfAXE55vsoMkyGEGmB9KnWm4N";
  let status = {};
  let txStatus = await checkValidTx(req.body);
  if (txStatus.success && txStatus.data){
    if (txStatus.data.status === "complete"){
      status = await releasePayment(req.body);
    }
    if (txStatus.data.status === "pending") {
       status = txStatus;
    }
  }
  
  return res.status(status.status).send(status.data);
})



  const transactionStatusMain = async(hash, token)=>{
    try {
      //const tx = JSON.stringify(rawTx);
      let transact_url = `${main_tx}/${hash}?token=${token}`
      const config = {
       method : 'get',
       url : transact_url,
       headers: { },
       //data : ""
     }
      let response = await axios(config);
      return  successResponse(200, response.data);
    } catch(error){
     console.error('error -> ', logStruct('transactionStatusMain', error))
     return errorResponse(error.status, error.message);
   }
  }
 


  router.post('/main', async(req, res, next) => {
      let hash = req.body.hash;
      let status = await transactionStatusMain(hash, token);
      return res.status(status.status).send(status.data);
  })
  
  module.exports = router;