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
const { Web3 }  = require('web3');
const hdPath =  require('./libs/path');
const SignerProvider = require('ethjs-provider-signer');
//const setWeb3Provider = require('./libs/setWeb3Provider');
const provider = require('./libs/provider');

//const autogenerate = require("./autogenerate");
const transactionModel = require('../../server/psql/models/transactions');
const walletModel = require('../../server/psql/models/wallet');
const { check, validationResult } = require('express-validator');
const {validateToken} = require('../../server/psql/middleware/auth');
require('dotenv').config({ path: '../../.env'});
const router  = express.Router();
const {successResponse, errorResponse} = require('./libs/response');
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

const checkEthUsdPrice = async () => {
  const ethPrice = require('eth-price');

  try {
    const response = await ethPrice('usd');//transactionsModel.updateTransactionRef(validInput);
    //const response = {};
    //response.data = price;
    console.log(response);
    return successResponse(200,response)
  } catch (error) {
    console.error('error -> ', logStruct('checkEthUsdPrice', error))
    return errorResponse(error.status, error.message);
  }
  
  }

const send_ether_to_escrow = async(req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
  }

    try {
      let comb = req.body.passphrase + req.user.user;
      const _passphrase = await walletModel.getWallet(req.body.wallet_id);
      const _evm = await walletModel.getEVM(req.body.wallet_id);
      const matchPwd = bcrypt.compareSync(String(comb), _passphrase[0].passphrase);
      //validTx.passphrase == cryptPwd ? true : false;
      if (!matchPwd) {
        return errorResponse(401,"passphrase_wrong", {message : "wrongPassphrase"});
      }
     
      if (req.body.wallet_id !== req.user.wallet_id) {
        return res.status(403).json({ msg : 'user wallet id mismatch' });
      }

     //const btc_balance = wall_bal[0].balance;
     const httpProvider = new Web3.providers.HttpProvider(provider.sepolia);
     const web3 = new Web3(httpProvider);
     let ethBalance = await web3.eth.getBalance(_evm[0].address);
     ethBalance = Number(ethBalance);
     ethBalance = await web3.utils.toWei(ethBalance, "ether");//ethBalance.toNumber();
     console.log(ethBalance);
     //ethBalance = ethBalance * Math.pow(10, -18);
     let amount_eth = Number(req.body.amount);
     const gasPrice = await web3.eth.getGasPrice();
     let ethAmount = await web3.utils.toWei(amount_eth, "ether");
     console.log(ethAmount);
    // gasPrice = gasPrice.toNumber();
     var gasLimit = 30000;//await web3.eth.sendTransaction({to : process.env.ESCROW_ACCOUNT_ETH, value : ethAmount }).estimateGas({ from: _evm[0].address });//get current gas limit
     //let sending;
     let gas = gasLimit * Number(gasPrice);
     let sending = ethAmount + gas;
     if (sending < ethBalance){
        return errorResponse(401, "insufficient_funds", {message: "insufficient funds"});
     }
     
     let keystrl = CryptoJS.AES.decrypt(_passphrase[0].mnemonic , pinHash(comb));
     const keystore = keystrl.toString(CryptoJS.enc.Utf8);

     const NewProvider = new SignerProvider(provider.sepolia, {
      signTransaction: keystore.signTransaction.bind(keystore),
      accounts: (cb) => cb(null,keystore.getAddresses()),
    });
     web3.setProvider(NewProvider);
      var sendParams = { from: _evm[0].address , to: process.env.ESCROW_ACCOUNT_ETH, value: ethAmount, gas: gasLimit, gasPrice: gasPrice };
      let txEth = await web3.eth.sendTransaction(sendParams);
      const txObj = {};
      txObj.wallet_id = req.body.wallet_id;
      txObj.address = _evm[0].address;
      txObj.tx_hash = txEth;
      txObj.mode = "eth";
      txObj.type = "credit";
      txObj.to = process.env.ESCROW_ACCOUNT_ETH;
      txObj.value = ethAmount;
      let getPrice = await checkEthUsdPrice();
      let eth_prc = getPrice.data;
      console.log(eth_prc);
      eth_prc = eth_prc[0];
      console.log(eth_prc);
      eth_prc = eth_prc.replace("USD: ",'');
      console.log(eth_prc);
      let usd = ethAmount * eth_prc *  Math.pow(10, -18);
      let sum = usd.toFixed(2);
      txObj.fiat = sum;
       
      await transactionModel.createTransaction(txObj);
      return successResponse(201, txObj, {txHash : txEth, wallet_id : req.body.wallet_id}, 'eth sent');
        
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



router.post('/send/escrow', validateToken, [
  check('wallet_id', 'Wallet id is required').not().isEmpty(),
  check('passphrase', 'Please include the pasphrase').not().isEmpty(),
  check('amount', 'Amount is required').not().isEmpty(),
  check('username', 'Username is required').not().isEmpty()
], async(req, res, next) => {
  const response = await send_ether_to_escrow(req, res);
  return res.status(response.status).send(response)
});


const check_eth_tx_status = async(req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
  }
  try {
  if (req.body.wallet_id !== req.user.wallet_id) {
      return res.status(403).json({ msg : 'user wallet id mismatch' });
    }
    
  const httpProvider = new Web3.providers.HttpProvider(provider.sepolia);
  const web3 = new Web3(httpProvider);
  const receipt = await web3.eth.getTransactionReceipt(req.body.txHash);
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

router.post('/send/escrow/status', validateToken,  [
  check('wallet_id', 'Wallet id is required').not().isEmpty(),
  check('txHash', 'Please include the transaction hash').not().isEmpty()
], async(req, res, next) => {
  const response = await check_eth_tx_status(req, res);
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