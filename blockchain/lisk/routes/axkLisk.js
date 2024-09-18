const express = require('express');
const bcrypt = require('bcryptjs');
const CryptoJS = require("crypto-js");
const pinHash = require('sha256');
const { hdkey, Wallet } = require('@ethereumjs/wallet');
const router  = express.Router();
const axkToken = require('../scripts/AXKToken');
require('dotenv').config();
const {successResponse, errorResponse} = require('../../eth/libs/response');
const privateKey = process.env.LISK_PRIV_KEY;
const fromAddress = process.env.ESCROW_ACCOUNT_ETH;
const walletModel = require('../../../server/psql/models/wallet');
const transactionModel = require('../../../server/psql/models/transactions');
const {authenticateUser, decryptPrivKey} = require('../../../server/psql/controllers/auth');
const { check, validationResult } = require('express-validator');
const {validateToken, validateAdmin} = require('../../../server/psql/middleware/auth');
require('dotenv').config({ path: '../../../.env'});

const logStruct = (func, error) => {
    return {'func': func, 'file': 'axkLisk', error}
  }

  const mintAxkToken = async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
    }
    try{   
      const mint_axk = await axkToken.mint(req.body);
      return successResponse(200, mint_axk, 'mint'); 
    } catch (error) {
    console.error('error -> ', logStruct('mintAxkToken', error))
    return errorResponse(error.status, error.message);
  }
  }

  router.post('/mint', validateAdmin,  [
    check('amount', 'Please include a passphrase').isNumeric().not().isEmpty(),
    check('to', 'Destination address is required').isEthereumAddress().not().isEmpty()
  ], async(req, res, next) => {
    req.body.fromAddress = fromAddress;
    req.body.privateKey = privateKey;
    console.log(req.body);
    //const {to, amount} = req.body
    const tx = await mintAxkToken(req, res);
  
    return res.status(tx.status).send(tx.data);
});

const transferAxkToken = async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
    }
    try{   
      const transfer_axk = await axkToken.transfer(req.body);
      return successResponse(200, transfer_axk, 'transfer'); 
    } catch (error) {
    console.error('error -> ', logStruct('transferAxkToken', error))
    return errorResponse(error.status, error.message);
  }
  }

  router.post('/transfer', validateToken, [
    check('amount', 'Please include a passphrase').isNumeric().not().isEmpty(),
    check('to', 'Destination address is required').isEthereumAddress().not().isEmpty()
  ],  async(req, res, next) => {
    req.body.fromAddress = fromAddress;
    req.body.privateKey = privateKey;
    console.log(req.body);
    //const {to, amount} = req.body
    const transfer = await transferAxkToken(req, res);
  
    return res.status(transfer.status).send(transfer.data);
});


const balanceAxkToken = async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
    }
    try{   
      const bal_axk = await axkToken.balanceOf(req.body.address);
      const balance = {
         balance : bal_axk
      }
      return res.send({balance: balance}); //successResponse(200, bal_axk, 'balance'); 
    } catch (error) {
    console.error('error -> ', logStruct('balanceAxkToken', error))
    return res.send(error.status);
  }
  }

  router.post('/balance', validateToken, [
    check('address', 'User address is required').isEthereumAddress().not().isEmpty()
  ], async(req, res, next) => {
    console.log(req.body);
    //const {to, amount} = req.body
    const balance = await balanceAxkToken(req, res);
  
    return balance;
});

const availableAxkToken = async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
    }
    try{   
      const supply_axk = await axkToken.totalSupply();
      const cap_axk = await axkToken.cap();
      let token_available_axk = cap_axk - supply_axk;
      //token_available_axk = token_available_axk * Math.pow(10, -18);
      token_available_axk = parseInt(token_available_axk);
      let bal_axk = {
        "total_supply" : supply_axk,
        "maximum_cap" : cap_axk,
        "tokens_available" : token_available_axk
      }
      return res.send({available : bal_axk});//uccessResponse(200, bal_axk, 'tokens available'); 
    } catch (error) {
    console.error('error -> ', logStruct('availableAxkToken', error))
    return res.send(error.message);//errorResponse(error.status, error.message);
  }
  }

  router.get('/available', validateToken, [
    check('x-auth-token', 'User token is required').isJWT().not().isEmpty()
  ], async(req, res, next) => {
    //console.log(req.body);
    //const {to, amount} = req.body
    const available = await availableAxkToken(req, res);
  
    return available;//res.status(balance.status).send(balance.data);
});

const balanceLiskToken = async(req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
  }
  try{   
    const bal_lisk = await axkToken.liskBalance(req.body);
    const balance = {
       balance : bal_lisk
    }
    const checkLisk = await walletModel.checkBalance({bal_lisk});
    if (!checkLisk && !checkLisk.length) {
      //return res.status(403).json({ msg : 'user doesnt exist' });
      await walletModel.cryptoBalance(bal_lisk);
    }
    else{
      await walletModel.updateBalance(bal_lisk);
    }
    return res.send({balance: balance}); //successResponse(200, bal_axk, 'balance'); 
  } catch (error) {
  console.error('error -> ', logStruct('balanceLiskToken', error))
  return res.send(error.message);
}
}

router.post('/lisk', validateToken, [
  check('address', 'User address is required').isEthereumAddress().not().isEmpty(),
  check('wallet_id', 'Wallet id is required').not().isEmpty()
], async(req, res, next) => {
  console.log(req.body);
  //const {to, amount} = req.body
  const balance = await balanceLiskToken(req, res);

  return balance;
});

const escrowLiskToken = async(req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
  }
  try{
      const auth_resp = await authenticateUser(req, res);
      const pk = decryptPrivKey(auth_resp);
      let reqData = {};
      reqData.priv_key = pk;
      const toAddress = req.body.to || null;
      const validTo = isAddress(toAddress);
      if (!toAddress || !validTo || toAddress === null){
        reqData.to = process.env.ESCROW_ACCOUNT_ETH;
      }
      else {
        reqData.to = toAddress;
      }
      reqData.from = auth_resp.evm.address;
      reqData.amount = req.body.amount;
      //console.log(priv_key);
      const transfer_lisk = await axkToken.transferLisk(reqData);
      const txObj = {};
      txObj.wallet_id = req.body.wallet_id;
      txObj.address = auth_resp.evm.address;
      txObj.tx_hash = transfer_lisk.txHash;
      txObj.mode = "lisk";
      txObj.type = "credit";
      txObj.to = reqData.to;
      txObj.value = transfer_lisk.amount;
      txObj.fiat = 0;
      await transactionModel.createTransaction(txObj);
      //return res.send({tx: txObj}); //successResponse(200, bal_axk, 'balance'); 
      return successResponse(201, txObj, {txHash : transfer_lisk.txHash, wallet_id : req.body.wallet_id}, 'lisk sent');
  } catch (error) {
  console.error('error -> ', logStruct('escrowLiskToken', error))
  //return res.send(error.message);
  return errorResponse(error.status, error.message);
}
}

router.post('/escrow', validateToken, [
  check('wallet_id', 'Wallet id is required').not().isEmpty(),
  check('passphrase', 'Please include the pasphrase').isNumeric().not().isEmpty(),
  check('amount', 'Amount is required').isNumeric().not().isEmpty()
], async(req, res, next) => {
  console.log(req.body);
  //const {to, amount} = req.body
  const escrow = await escrowLiskToken(req, res);

  return res.status(escrow.status).send(escrow.data);
});

router.post('/send', validateToken, [
  check('wallet_id', 'Wallet id is required').not().isEmpty(),
  check('passphrase', 'Please include the pasphrase').isNumeric().not().isEmpty(),
  check('amount', 'Amount is required').isNumeric().not().isEmpty(),
  check('to', 'Please include a destination address').isEthereumAddress().not().isEmpty(),
], async(req, res, next) => {
  console.log(req.body);
  //const {to, amount} = req.body
  const send = await escrowLiskToken(req, res);

  return res.status(send.status).send(send.data);
});


module.exports = router;