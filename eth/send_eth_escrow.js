const bip32 = require('bip32')
const bip39 = require('bip39')
//const bitcoin = require('bitcoinjs-lib')
const moment = require('moment');
const express = require('express');
const cors = require('cors');
const CryptoJS = require("crypto-js");
const pinHash = require('sha256');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
//const lightwallet  = require('eth-lightwallet');
const Web3  = require('web3');
const hdPath =  require('./libs/path');
const SignerProvider = require('ethjs-provider-signer');
//const setWeb3Provider = require('./libs/setWeb3Provider');
const provider = require('./libs/provider');
require('dotenv').config();
//const autogenerate = require("./autogenerate");

const router  = express.Router();
const logStruct = (func, error) => {
    return {'func': func, 'file': 'send_eth_escrow', error}
  }

  
 /** function getETHUSD(amount){
  var ethUSD = null;
  $.ajax({
    url: `${AUTH_BACKEND_URL}/doeremi/v1/transactions/fetchEthPrice`,
    dataType: "JSON",
    contentType: "application/json",
    method: "GET",
    async: false,
    error: (err) => {
    alert("error");
      //return false;
      //window.location.href = '/agroAfrica/v1/user/'+localStorage.getItem('role')+'/profile/'+localStorage.getItem('user_id') + '/';
    },
    success: function(results){
      if (results.data){
        ethUSD = results.data;
        console.log(ethUSD);

        }
      }
})

return ethUSD;
}  **/


const send_ether_to_escrow = async(reqData) => {
    try {
      let comb = reqData.passphrase + reqData.username;
      const matchPwd = bcrypt.compareSync(String(comb), reqData.encrypted);
      //validTx.passphrase == cryptPwd ? true : false;
      if (!matchPwd) {
        return errorResponse(401,"passphrase_wrong", {message : "wrongPassphrase"});
      }
     
     //const btc_balance = wall_bal[0].balance;
     const web3 = new Web3.providers.HttpProvider(provider.sepolia);
     let ethBalance = await web3.eth.getBalance(reqData.from);
     ethBalance = ethBalance.toNumber();
     ethBalance = await web3.toWei(ethBalance, "ether");//ethBalance.toNumber();
     //ethBalance = ethBalance * Math.pow(10, -18);
     let amount_eth = reqData.amount;
     const gasPrice = await web3.eth.gasPrice();
     let ethAmount = await web3.toWei(amount_eth, "ether");
    // gasPrice = gasPrice.toNumber();
     var gasLimit = await web3.eth.sendTransaction({to : process.env.ESCROW_ACCOUNT_ETH, value : ethAmount }).estimateGas({ from: from });//get current gas limit
     let sending = reqData.amount;
     let gas = gasLimit * gasPrice;
     sending = amount_eth + gas;
     if (sending < ethBalance){
        return errorResponse(401, "insufficient_funds", {message: "insufficient funds"});
     }

     
     

     let keystrl = CryptoJS.AES.decrypt(reqData.keystore, pinHash(comb));
     const keystore = keystrl.toString(CryptoJS.enc.Utf8);

      const newProvider = new Web3.providers.HttpProvider(provider.sepolia, keystore);

      var sendParams = { from: reqData.from, to: process.env.ESCROW_ACCOUNT_ETH, value: ethAmount, gas: gasLimit, gasPrice: gasPrice };
      let txEth = await newProvider.eth.sendTransaction(sendParams);
      const txObj = {};
      txObj.user_id = reqData.user_id;
      txObj.from = reqData.from;
      txObj.amount = ethAmount;
      txObj.to = process.env.ESCROW_ACCOUNT_ETH;
      txObj.kes = reqData.amount;
      txObj.index = 0;
      txObj.user = reqData.username;
      //txObj.current = destination.address;
      //txObj.wif = CryptoJS.AES.encrypt(destination.wif, comb).toString();
      //txObj.timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
      //txObj.rawTx = rawTx;
      txObj.txHash = txEth;
      console.log(txEth);
      //console.log(rawTx);
     
      //const respDec = await decodeRawTransaction(rawTx, token);
   
       //const respPush = await pushRawTransaction(tx, token);   
       

      return successResponse(201, txObj, {txHash : txEth, user_id : reqData.user_id}, 'eth sent');
        
      //implement sendRawTX
      
     } catch (error) {
       console.error('error -> ', logStruct('send_ether_to_escrow', error))
       return errorResponse(error.status, error.message);
     }
   
    }       
/**
Function/Module Name : escrow
Purpose : is a POST Api endpoint that allows users to send their Ether holdings to escrow
Input: passphrase , amount, gaspricfunctione,  tokenToSend, contractAddress, contractABI, keystore
Output :  The transaction Hash of the sent transaction
**/



router.post('/send/escrow',  async(req, res, next) => {
  const response = await send_ether_to_escrow(req.body);
  return res.status(response.status).send(response)
});


const check_eth_tx_status = async(data) => {
  try {
  const web3 = new Web3.providers.HttpProvider(provider.sepolia);
  const receipt = await web3.eth.getTransactionReceipt(data.txHash);
  const receipt_status = receipt.status;
  if(receipt_status == 0x1) {
      data.status = "complete";
      return successResponse(200, {status : "success"}, "success", "success");
     }
  if(receipt_status == 0x0) { 
      data.status = "failed";
     return successResponse(200, {status : "fail"}, "fail", "fail");
  }
  }  catch(error){
    console.error('error -> ', logStruct('check_eth_tx_status', error))
    return errorResponse(error.status, error.message);
  }
}

router.post('/send/escrow/status',  async(req, res, next) => {
  const response = await check_eth_tx_status(req.body.txHash);
  return res.status(response.status).send(response)
});

const check_eth_tx_status_ext = async(data) => {
  try {
  const web3 = new Web3.providers.HttpProvider(provider.sepolia);
  const receipt = await web3.eth.getTransactionReceipt(data.txHash);
  const amount = web3.utils.toWei(data.amount, "wei");
  const receipt_status = receipt.status;
  const _amount = receipt.value;
  const _address = receipt.to;
  if(receipt_status == 0x1 && amount == _amount && _address == process.env.ESCROW_ACCOUNT_ETH) {
      data.status = "complete";
      return successResponse(200, receipt, {status : "success"}, "success");
     }
  if(receipt_status == 0x0) { 
      data.status = "failed";
      
     return successResponse(200, {status : "fail"}, "fail", "fail");
  }
  }  catch(error){
    console.error('error -> ', logStruct('check_eth_tx_status', error))
    return errorResponse(error.status, error.message);
  }
}




module.exports = router;