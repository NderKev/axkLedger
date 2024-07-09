const express = require('express');
const router  = express.Router();
const axkToken = require('../scripts/AXKToken');
require('dotenv').config();
const {successResponse, errorResponse} = require('../../eth/libs/response');
const privateKey = process.env.LISK_PRIV_KEY;
const fromAdress = process.env.ESCROW_ACCOUNT_ETH;
const logStruct = (func, error) => {
    return {'func': func, 'file': 'axkLisk', error}
  }

  const mintAxkToken = async(data) => {
    try{   
      const mint_axk = await axkToken.mint(data);
      return successResponse(200, mint_axk, 'mint'); 
    } catch (error) {
    console.error('error -> ', logStruct('mintAxkToken', error))
    return errorResponse(error.status, error.message);
  }
  }

  router.post('/mint',  async(req, res, next) => {
    req.body.fromAdress = fromAdress;
    req.body.privateKey = privateKey;
    console.log(req.body);
    //const {to, amount} = req.body
    const tx = await mintAxkToken(req.body);
  
    return res.status(tx.status).send(tx.data);
});

const transferAxkToken = async(data) => {
    try{   
      const mint_axk = await axkToken.mint(data);
      return successResponse(200, mint_axk, 'transfer'); 
    } catch (error) {
    console.error('error -> ', logStruct('transferAxkToken', error))
    return errorResponse(error.status, error.message);
  }
  }

  router.post('/transfer',  async(req, res, next) => {
    req.body.fromAdress = fromAdress;
    req.body.privateKey = privateKey;
    console.log(req.body);
    //const {to, amount} = req.body
    const transfer = await transferAxkToken(req.body);
  
    return res.status(transfer.status).send(transfer.data);
});


const balanceAxkToken = async(req, res) => {
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

  router.post('/balance',  async(req, res, next) => {
    console.log(req.body);
    //const {to, amount} = req.body
    const balance = await balanceAxkToken(req, res);
  
    return balance;
});

const availableAxkToken = async(req, res) => {
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
    return res.send(error.status);//errorResponse(error.status, error.message);
  }
  }

  router.get('/available',  async(req, res, next) => {
    //console.log(req.body);
    //const {to, amount} = req.body
    const available = await availableAxkToken(req, res);
  
    return available;//res.status(balance.status).send(balance.data);
});

module.exports = router;