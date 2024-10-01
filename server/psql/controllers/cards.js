const { validationResult } = require('express-validator');
const cards = require('../models/cards');

exports.createCard = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //const { wallet_id, address, tx_hash, mode, value, fiat} = req.body;
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
      const response = await cards.createCard(req.body);
      return res.status(200).json(response);
    } catch (error) {
      console.error('createCard', error.message);
      return res.status(error.status).json(error.message);
    }
  };

  exports.updateCard = async (req, res) => {
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
      await cards.updateCard(req.body);
      return res.status(200).json({card_number : req.body.card_number , msg : ' user card updated'});
    } catch (error) {
      console.error('updateCard', error.message);
      return res.status(error.status).json(error.message);
    }
  };

  exports.cardBalance = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //const { wallet_id, address, tx_hash, mode, value, fiat} = req.body;
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
      const response = await cards.cardBalance(req.body);
      return res.status(200).json(response);
    } catch (error) {
      console.error('cardBalance', error.message);
      return res.status(error.status).json(error.message);
    }
  };

  exports.updateCardBalance = async (req, res) => {
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
      await cards.updateCardBalance(req.body);
      return res.status(200).json({card_id : req.body.card_number , msg : ' user card balance updated'});
    } catch (error) {
      console.error('updateCardBalance', error.message);
      return res.status(error.status).json(error.message);
    }
  };

  exports.getCard = async (req, res) => {
    try {
      const crd = await cards.getCard(req.body.card_number);
      return res.status(200).json(crd);
    } catch (err) {
      console.error(err.message);
      return res.status(err.status).send('Internal server error get card by number');
    }
  };

  exports.getUserCards = async (req, res) => {
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
      const crds = await cards.getUserCards(walletid);
      return res.status(200).json(crds);
    } catch (err) {
      console.error(err.message);
      return res.status(err.status).send('Internal server error get cards by user');
    }
  };

  exports.getUserCard = async (req, res) => {
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
      const cd = await cards.getUserCard({card_number : req.body.card_number, wallet_id : walletid});
      return res.status(200).json(cd);
    } catch (err) {
      console.error(err.message);
      return res.status(err.status).send('Internal server error get card by user');
    }
  };


  exports.getCardBalance = async (req, res) => {
    try {
      const cdb = await cards.getCardBalance(req.body);
      return res.status(200).json(cdb);
    } catch (err) {
      console.error(err.message);
      return res.status(err.status).send('Internal server error get cards balance');
    }
  };


