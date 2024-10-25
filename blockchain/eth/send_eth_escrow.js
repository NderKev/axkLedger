const bip32 = require('bip32');
const bip39 = require('bip39');
const moment = require('moment');
const express = require('express');
const cors = require('cors');
const CryptoJS = require("crypto-js");
const pinHash = require('sha256');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const { Web3 }  = require('web3');
const hdPath =  require('./libs/path');
const SignerProvider = require('ethjs-provider-signer');
const provider = require('./libs/provider');
const { hdkey, Wallet } = require('@ethereumjs/wallet');
const transactionModel = require('../../server/psql/models/transactions');
const transactionController = require('../../server/psql/controllers/transactions');
const walletModel = require('../../server/psql/models/wallet');
const userModel = require('../../server/psql/models/users');
const { check, validationResult } = require('express-validator');
const {validateToken, validateAdmin} = require('../../server/psql/middleware/auth');
const {authenticateUser, decryptPrivKey, authenticateAdmin, authenticatePinAdmin, authenticatePin} = require('../../server/psql/controllers/auth');
const {isAddress} = require("web3-validator");
const usdtContractAbi = require('./libs/usdtContractAbi');
const usdtContract = require("./libs/usdtContract");
const config = require('../config');
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
      const usr = req.user, adm = req.admin;
      let walletid, name;
      if (usr){
          walletid = usr.wallet_id;
          name = usr.user;
      }
      else {
          walletid = adm.wallet_id;
          name = adm.user;
      }
      let auth_data = {}, pin_set = true;
      const check_pin = await userModel.fetchUserPin(walletid);
      const auth = check_pin[0].pin;
       if (typeof auth === 'undefined' || auth === null || auth == 'null'){
         pin_set = false;
       }
      if (pin_set == true && auth !== 'null' && adm) {
       await authenticatePinAdmin(req, res);
       auth_data = await authenticateAdmin(req, res);
      }
      if (pin_set == true && auth !== 'null' && usr) {
       await authenticatePin(req, res);
       auth_data = await authenticateUser(req, res);
      }
     const amount_eth = Number(req.body.amount);
     console.log(amount_eth);
     //if (amount_eth < 0)
     console.log(auth_data);
     const httpProvider = new Web3.providers.HttpProvider(provider.sepolia);
     const web3 = new Web3(httpProvider);
     const ethBalance = await web3.eth.getBalance(auth_data.evm.address);
     console.log(ethBalance);
     //ethBalance = Number(ethBalance);
     //ethBalance = await web3.utils.toWei(ethBalance, "ether");//ethBalance.toNumber();
     //console.log(ethBalance);
     const eth_balance = Number(ethBalance);
     console.log(eth_balance);
     //ethBalance = ethBalance * Math.pow(10, -18);
     const _gasprice = await web3.eth.getGasPrice();
     const gas_price = Number(_gasprice);
     //const gasPrice_ = web3.utils.fromWei(gas_price, "gwei");
     //console.log(gasPrice_);
     //const gasPrice = web3.utils.toWei("300", "gwei");
     //console.log(gasPrice);
     const ethAmount =  web3.utils.toWei(amount_eth, "ether");
     console.log(ethAmount);
     const eth_amount = Number(ethAmount);
     console.log(eth_amount);
    // gasPrice = gasPrice.toNumber();
     //const checkGas = await web3.eth.sendTransaction({to : config.ESCROW_ETH, value : ethAmount }).estimateGas({ from: _evm[0].address });
     const gasLimit = 53000;////get current gas limit
     //let sending;
     const _gas = gasLimit * gas_price;
     const sending = eth_amount + _gas;
     console.log(sending);
     if (sending > eth_balance){
        return errorResponse(401, "insufficient_funds", {message: "insufficient funds"});
     }

      const dec_amount = amount_eth * Math.pow(10, 6);
     
      const p_key = decryptPrivKey(auth_data);
      const toAddress = req.body.to || null;
      const validTo = isAddress(toAddress);
      let tx = { from: auth_data.evm.address , to: "0x0", value: ethAmount, gas: gasLimit, gasPrice: _gasprice, chainId: 11155111};
      if (!toAddress || !validTo || toAddress === null || toAddress == 'null' ){
        tx.to = config.ESCROW_ETH;
      }
      else {
        tx.to = toAddress;
      }

      console.log(tx);
      const signedTx = await web3.eth.accounts.signTransaction(tx, p_key.key);
      const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      console.log("tx Hash :" + txHash.transactionHash);
      const txObj = {};
      txObj.wallet_id = walletid;
      txObj.address = auth_data.evm.address;
      txObj.tx_hash = txHash.transactionHash;
      txObj.mode = "eth";
      txObj.type = "credit";
      txObj.to = tx.to;
      txObj.value = dec_amount;
      let getPrice = await checkEthUsdPrice();
      let eth_prc = getPrice.data;
      console.log(eth_prc);
      eth_prc = eth_prc[0];
      console.log(eth_prc);
      eth_prc = eth_prc.replace("USD: ",'');
      console.log(eth_prc);
      let usd = eth_amount * eth_prc *  Math.pow(10, -18);
      let sum = usd.toFixed(2);
      txObj.fiat = sum;
      //tx Hash :0xd46167c3b87bb5a2fad4bf9beeab65fe88215cab4876a705e2bbbce39fded944
      //let tx_fiat = await transactions.getTransactionByHash(sent_wif[0].txHash);
      await transactionModel.createTransaction(txObj);
      const link = `https://sepolia.etherscan.io/tx/${txObj.tx_hash}`
      const txData = {
        wallet_id : walletid,
        name : name,
        fiat : txObj.fiat,
        link : link,
        crypto : 'eth-sepolia',
        address : txObj.to
      }
      try {
        await transactionController.sendTransactionMail(txData)
      } catch (error) {
        console.log(error);
      } 
      
      web3.setProvider(httpProvider);
      return successResponse(201, txObj, {txHash : txObj.tx_hash, wallet_id : walletid}, 'eth sent');
        
      //implement sendRawTX

     } catch (error) {
       console.error('error -> ', logStruct('send_ether_to_escrow', error))
       return errorResponse(error.status, error.message);
     }
   
    }       
/**
Function/Module Name : escrow
Purpose : is a POST Api endpoint that allows users to send their Ether holdings to escrow
Input: passphrase , amount, username,  wallet_id
Output :  The transaction Hash of the sent transaction
**/



router.post('/send/escrow', [
  check('passphrase', 'Please include the pasphrase').isNumeric().not().isEmpty(),
  check('amount', 'Amount is required').isNumeric().not().isEmpty()
], validateToken, async(req, res, next) => {
  const response = await send_ether_to_escrow(req, res);
  return res.status(response.status).send(response)
});


router.post('/send/transfer', [
  check('passphrase', 'Please include the pasphrase').isNumeric().not().isEmpty(),
  check('amount', 'Amount is required').isNumeric().not().isEmpty(),
  check('to', 'Please include a destination address').isEthereumAddress().not().isEmpty(),
], validateToken, async(req, res, next) => {
  const response = await send_ether_to_escrow(req, res);
  return res.status(response.status).send(response);
});

router.post('/send/adm', [
  check('pin', 'Please include the pin').isNumeric().not().isEmpty(),
  check('amount', 'Amount is required').isNumeric().not().isEmpty(),
  check('to', 'Please include a destination address').isEthereumAddress().not().isEmpty(),
], validateAdmin, async(req, res, next) => {
  const response = await send_ether_to_escrow(req, res);
  return res.status(response.status).send(response);
});

const check_eth_tx_status = async(req, res) => {
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
  check('txHash', 'Please include the transaction hash').isHexadecimal().not().isEmpty()
], async(req, res, next) => {
  const response = await check_eth_tx_status(req, res);
  return res.status(response.status).send(response)
});

router.post('/send/admin/status', validateAdmin,  [
  check('txHash', 'Please include the transaction hash').isHexadecimal().not().isEmpty()
], async(req, res, next) => {
  const response = await check_eth_tx_status(req, res);
  return res.status(response.status).send(response)
});


const check_eth_tx_status_ext = async(req, res) => {
  try {
  const web3 = new Web3.providers.HttpProvider(provider.sepolia);
  const receipt = await web3.eth.getTransactionReceipt(data.txHash);
  const amount = web3.utils.toWei(data.amount, "wei");
  const receipt_status = receipt.status;
  const _amount = receipt.value;
  const _address = receipt.to;
  if(receipt_status == 0x1 && amount == _amount && _address == config.ESCROW_ETH) {
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

const send_usdt_usdc_token = async(req, res) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
    }
  try {
  const auth_ver = await authenticateUser(req, res);
  const web3 = new Web3.providers.HttpProvider(provider.provider);
  if (req.body.token === "usdt"){
     const USDTContract = new web3.eth.Contract(usdtContractAbi, usdtContract);
     const decimals = await USDTContract.methods.decimals().call;
     const ten6 = Math.pow(10, decimals);
     const _amount = Number(req.body.amount) * ten6;
     console.log(_amount);
     const usdt_bal = await USDTContract.methods.balanceOf(data.from).call;
     let bal_usdt = Number(usdt_bal.toString());
     //bal_usdt = bal_usdt * Math.pow(10 , -);
     //bal_axk = parseInt(bal_axk);
     console.log(bal_usdt);
     if (_amount > bal_usdt){
      return errorResponse(401, "insufficient_funds_usdt", {message: "insufficient funds"});
     }
     let destAddress = req.body.to || null;
     const validDest = isAddress(destAddress);
     if (!destAddress || !validDest || destAddress === null){
       req.body.to = config.ESCROW_ETH;
    }
    else {
      req.body.to = destAddress;
    }
     const pr = decryptPrivKey(auth_ver);
     const tx = USDTContract.methods.transfer(req.body.to, _amount);//.send({ from: dtt.fromAddress });
     const transfer_response = await sendTransaction(tx, req.body.from, pr.key);
     console.log("response : " + transfer_response);
     let dataTx = {
       txHash : transfer_response.transactionHash,
       amount : _amount,
       to : req.body.to
     };
     const txObj = {};
      txObj.wallet_id = req.user.wallet_id;
      txObj.address = auth_ver.evm.address;
      txObj.tx_hash = dataTx.txHash;
      txObj.mode = "usdt";
      txObj.type = "credit";
      txObj.to = req.body.to;
      txObj.value = Number(req.body.amount);
      txObj.fiat =   Number(req.body.amount);

     await transactionModel.createTransaction(txObj);
     return successResponse(201, txObj, {txHash : dataTx.txHash, wallet_id : req.user.wallet_id}, 'usdt sent');
  }
}  catch(error){
  console.error('error -> ', logStruct('send_usdt_usdc_token', error))
  return errorResponse(error.status, error.message);
}

}

async function sendTransaction(tx, fromAddress, privateKey) {
  try {
      const web3 = new Web3.providers.HttpProvider(provider.provider);
      const gas = await tx.estimateGas({ from: fromAddress });
      console.log("gas :" + gas);
      const gasPrice = await web3.eth.getGasPrice();
      const count = await web3.eth.getTransactionCount(fromAddress);
      const txData = tx.encodeABI();
      const nonce = web3.utils.toHex(count);
      
      const signedTx = await web3.eth.accounts.signTransaction(
          {
              to: contractAddress,
              data: txData,
              nonce: nonce,
              gas,
              gasPrice,
          },
          privateKey
      );

      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      console.log('Transaction receipt: ', receipt);
      return receipt;
  } catch (error) {
      console.error('Transaction error: ', error);
  }
}
//

router.post('/usdt/escrow', [
  check('wallet_id', 'Wallet id is required').not().isEmpty(),
  check('passphrase', 'Please include the pasphrase').isNumeric().not().isEmpty(),
  check('amount', 'Amount is required').isNumeric().not().isEmpty(),
  check('token', 'token id is required').isString().not().isEmpty(),
], validateToken, async(req, res, next) => {
  const response = await send_usdt_usdc_token(req, res);
  return res.status(response.status).send(response)
});


router.post('/usdt/transfer', [
  check('wallet_id', 'Wallet id is required').not().isEmpty(),
  check('passphrase', 'Please include the pasphrase').isNumeric().not().isEmpty(),
  check('amount', 'Amount is required').isNumeric().not().isEmpty(),
  check('token', 'token id is required').isString().not().isEmpty(),
  check('to', 'Please include a destination address').isEthereumAddress().not().isEmpty(),
], validateToken, async(req, res, next) => {
  const response = await send_usdt_usdc_token(req, res);
  return res.status(response.status).send(response)
});


const balanceUsdtToken = async(req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
  }
  try{   
     const web3 = new Web3.providers.HttpProvider(provider.provider);
     const USDTContract = new web3.eth.Contract(usdtContractAbi, usdtContract);
     const decimals = await USDTContract.methods.decimals().call;
     const ten6 = Math.pow(10, -decimals);
     const usdt_bal = await USDTContract.methods.balanceOf(data.from).call;
     let bal_usdt = Number(usdt_bal.toString());
     bal_usdt = bal_usdt * ten6;
     
    return res.send({balance: bal_usdt}); //successResponse(200, bal_axk, 'balance'); 
  } catch (error) {
  console.error('error -> ', logStruct('balanceUsdtToken', error))
  return res.send(error.status);
}
}

router.get('/usdt', validateToken, [
  check('address', 'User address is required').isEthereumAddress().not().isEmpty()
], async(req, res, next) => {
  console.log(req.body);
  //const {to, amount} = req.body
  const balance = await balanceUsdtToken(req, res);

  return balance;
});



module.exports = router;