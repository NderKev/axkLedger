const { validationResult } = require('express-validator');
//const {isAddress} = require("web3-validator");
const transactions = require('../models/transactions');
const { TransactionMail } = require('../../mails');
const sendEmail = require('../../helpers/sendMail');
const nodemailer = require('nodemailer');
const config = require('../config');
const users = require('../models/users');

exports.createTransaction = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //const { wallet_id, address, tx_hash, mode, value, fiat} = req.body;
    try {
      const usr = req.user, adm = req.admin;
      let walletid, name;
      if (usr){
        walletid = usr.wallet_id;
        name = usr.user;
      }
      else {
        walletid = adm.wallet_id
        name = adm.user;
      }
      /** if (req.body.wallet_id !== walletid) {
        return res.status(403).json({ msg : 'user wallet id mismatch' });
      } **/

      req.body.wallet_id == walletid;  
      const response = await transactions.createTransaction(req.body);
    
      return res.status(200).json(response);
    } catch (error) {
      console.error('createTransaction', error.message);
      return res.status(error.status).json(error.message);
    }
  };

exports.sendTransactionMail = async (data) => {
    //const { ema, address, tx_hash, mode, value, fiat} = req.body;
    let resSend = {};
    try { 
      const get_user = await users.getUserEmailByWalletId(data.wallet_id);
      const email = get_user[0].email,
      name = data.name,
      amount = data.fiat,
      link = data.link,
      crypto = data.crypto,
      address = data.address;
      try {
        await sendEmail(email, TransactionMail(name, link, amount, crypto, address));
      } catch (error) {
        console.log(error);
      }
      resSend.data = data;
      resSend.status = "success";
      return resSend; 
    } catch (error) {
      console.error('sendTransactionMail', error.message);
      resSend.data = data;
      resSend.status = "error";
      return resSend;
    }
  };
  

  exports.updateTransaction = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //const { wallet_id, tx_hash, type, status, value, fiat} = req.body;
    try {
      const usr = req.user, adm = req.admin;
      let walletid;
      if (usr){
        walletid = usr.wallet_id;
      }
      else {
        walletid = adm.wallet_id
      }
      if (req.body.wallet_id !== walletid) {
        return res.status(403).json({ msg : 'user wallet id mismatch' });
      }  
      await transactions.updateTransactionData(req.body);
      return res.status(200).json({tx_hash : req.body.tx_hash , msg : ' transaction  updated'});
    } catch (error) {
      console.error('updateTransaction', error.message);
      return res.status(error.status).json(error.message);
    }
  };


  exports.updateTransactionHash = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //const {wallet_id, tx_hash, status, value, fiat} = req.body;
    try {
      const usr = req.user, adm = req.admin;
      let walletid;
      if (usr){
        walletid = usr.wallet_id;
      }
      else {
        walletid = adm.wallet_id
      }
      if (req.body.wallet_id !== walletid) {
        return res.status(403).json({ msg : 'user wallet id mismatch' });
      }  
      await transactions.updateTransactionHash(req.body);
      return res.status(200).json({tx_hash : req.body.tx_hash , msg : ' transaction  updated'});
    } catch (error) {
      console.error('updateTransactionHash', error.message);
      return res.status(error.status).json(error.message);
    }
  };


  exports.updateTransactionStatus = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //const {wallet_id, tx_hash, status} = req.body;
    try {
      const usr = req.user, adm = req.admin;
      let walletid;
      if (usr){
        walletid = usr.wallet_id;
      }
      else {
        walletid = adm.wallet_id
      }
      if (req.body.wallet_id !== walletid) {
        return res.status(403).json({ msg : 'user wallet id mismatch' });
      }  
      await transactions.updateStatus(req.body);
      return res.status(200).json({tx_hash : req.body.tx_hash , msg : ' transaction status updated'});
    } catch (error) {
      console.error('updateTransactionStatus', error.message);
      return res.status(error.status).json(error.message);
    }
  };


  exports.getTransactionsByUser = async (req, res) => {
    try {
      const usr = req.user, adm = req.admin;
      let walletid;
      if (usr){
        walletid = usr.wallet_id;
      }
      else {
        walletid = adm.wallet_id
      }
      console.log(walletid);
      const txs = await transactions.getTransactionByWalletId(walletid);
      return res.status(200).json(txs);
    } catch (err) {
      console.error(err.message);
      return res.status(err.status).send('Internal server error get transactions by user');
    }
  };

  exports.getAllTransactions = async (req, res) => {
    try {
      const adm = req.admin;
      if (!adm){
        return res.status(403).json({ msg : 'Unauthorized Request' });
      }
      const txs = await transactions.getAllTxs();
      return res.status(200).json(txs);
    } catch (err) {
      console.error(err.message);
      return res.status(err.status).send('Internal server error get all transactions');
    }
  };

  exports.getTransactionByHash = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const hash = req.params.hash;
      const tx = await transactions.getTransactionByHash(hash);
      return res.status(200).json(tx);
    } catch (err) {
      console.error(err.message);
      return res.status(err.status).send('Internal server error get transaction by hash');
    }
  };

  exports.getUserTransactionByHash = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      //const {tx_hash, }
      const usr = req.user, adm = req.admin;
      let walletid;
      if (usr){
        walletid = usr.wallet_id;
      }
      else {
        walletid = adm.wallet_id
      }
      console.log(walletid);
      const tx_hash = req.params.tx_hash;
      const tx = await transactions.getTransactionByUtx({wallet_id : walletid, tx_hash : tx_hash});
      return res.status(200).json(tx);
    } catch (err) {
      console.error(err.message);
      return res.status(err.status).send('Internal server error get user transaction by hash');
    }
  };


  exports.getUserDeposits = async (req, res) => {
    try {
      //const {tx_hash, }
      const usr = req.user, adm = req.admin;
      let walletid;
      if (usr){
        walletid = usr.wallet_id;
      }
      else {
        walletid = adm.wallet_id
      }
      console.log(walletid);
      const deps = await transactions.getDepositsUser(walletid);
      return res.status(200).json(deps);
    } catch (err) {
      console.error(err.message);
      return res.status(err.status).send('Internal server error get user deposit transactions');
    }
  };



  exports.getUserTransfers = async (req, res) => {
    try {
      //const {tx_hash, }
      const usr = req.user, adm = req.admin;
      let walletid;
      if (usr){
        walletid = usr.wallet_id;
      }
      else {
        walletid = adm.wallet_id
      }
      console.log(walletid);
      const trans = await transactions.getTransfersUser(walletid);
      return res.status(200).json(trans);
    } catch (err) {
      console.error(err.message);
      return res.status(err.status).send('Internal server error get user transfer transactions');
    }
  };

  exports.getTransactionsByMode = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const adm = req.admin;
      if (!adm){
        return res.status(403).json({ msg : 'Unauthorized Request' });
      }
      const mode = req.params.mode;
      const tx_mode = await transactions.getTxsByMode(mode);
      return res.status(200).json(tx_mode);
    } catch (err) {
      console.error(err.message);
      return res.status(err.status).send('Internal server error get all transactions by mode');
    }
  };

  exports.getUserTransactionsByMode = async (req, res) => {
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
      console.log(walletid);
      const mode = req.body.mode;
      const trans = await transactions.getUserTxsByMode({wallet_id : walletid, mode : mode});
      return res.status(200).json(trans);
    } catch (err) {
      console.error(err.message);
      return res.status(err.status).send('Internal server error get user transactions by mode');
    }
  };