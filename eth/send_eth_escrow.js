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

const convertKestoETH = async(amount) => {
    let eth_price = await transactionController.checkEthPriceUSD();
    let usd_price = eth_price.data;
    //let eth_prc = getPrice.data;
    console.log(usd_price);
    usd_price = usd_price[0];
    console.log(usd_price);
    usd_price = usd_price.replace("USD: ",'');
    console.log(usd_price);
    let pr = usd_price.toFixed(2);
    console.log(pr);
    //let usd = bal_wei * pr;
    //let sum = usd.toFixed(2);
    //console.log(sum);
    let ksh_usd = await transactionController.rateUsdToKes();
    ksh_usd = ksh_usd.data.toFixed(2);
    if(ksh_usd <= 0){
        ksh_usd = 110
    }
    let kes_price = usd_price * ksh_usd;
    kes_price = kes_price.toFixed(2);
    let eth_amount = 0;
    if (amount < 100000){ // 2% commission
      eth_amount = (amount/kes_price) * 1.02;
   }
   else if (amount > 100000 && amount < 250000){ // 2.75% commission
    eth_amount = (amount/kes_price) * 1.0275;
   }
   else if (amount > 250000 && amount < 500000){ // 3.5%
    eth_amount = (amount/kes_price) * 1.035;
 }

 else if (amount > 500000 && amount < 750000){ // 4.25%
  eth_amount = (amount/kes_price) * 1.0425;
}
else { // 5%
  eth_amount = (amount/kes_price) * 1.05;
}
    eth_amount = eth_amount.toFixed(6);
    return eth_amount;
  }




const send_ether_to_escrow = async(reqData) => {
    try {
    
     //const wall_bal = await walletModel.checkWalletBalance(reqData.user_id, "btc");
     //const btc_balance = wall_bal[0].balance;
     const web3 = new Web3.providers.HttpProvider(provider.sepolia);
     let ethBalance = await web3.eth.getBalance(reqData.from);
     ethBalance = ethBalance.toNumber();
     ethBalance = await web3.toWei(ethBalance, "ether");//ethBalance.toNumber();
     //ethBalance = ethBalance * Math.pow(10, -18);
     const gasPrice = await web3.eth.gasPrice();
    // gasPrice = gasPrice.toNumber();
     var gasLimit = 30000; //get current gas limit
     let sending = reqData.amount;
     let amount_eth = reqData.amount;
     let gas = gasLimit * gasPrice;
     sending = amount_eth + gas;
     if (sending < ethBalance){
        return errorResponse(401, "insufficient_funds", {message: "insufficient funds"});
     }

     let ethAmount = await web3.toWei(amount_eth, "ether");

  

      const newProvider = new Web3.providers.HttpProvider(provider.sepolia, keystore);

      var sendParams = { from: validEthTx.from, to: process.env.ESCROW_ACCOUNT_ETH, value: ethAmount,gasPrice, gas: gasLimit };
      let txEth = await newProvider.eth.sendTransaction(sendParams);
      const txObj = {};
      txObj.user_id = reqData.user_id;
      txObj.from = validEthTx.from;
      txObj.amount = ethAmount;
      txObj.to = process.env.ESCROW_ACCOUNT_ETH;
      txObj.kes = reqData.amount;
      txObj.index = 0;
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



router.post('/send/escrow', auth_ver, async(req, res, next) => {
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

router.post('/send/escrow/status', auth_ver, async(req, res, next) => {
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