const db = require('../models/db');
const moment = require('moment');

exports.createCard = async (data) => {
    const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    const query = db.write('axk_card').insert({
      wallet_id: data.wallet_id,
      card_name : data.card_name,
      card_number: data.card_number,
      type : data.type,
      state : "active",
      balance : 0,
      cvc : data.cvc,
      expiry : data.expiry,
      created_at: createdAt,
      updated_at: createdAt
    });
    console.info("query -->", query.toQuery())
    return query;
  };
  
  exports.getCard = async (data) => {
    const query = db.read.select('*')
      .from('axk_card')
      .where('card_number', data);   
      return query;
  };

  exports.getUserCard = async (data) => {
    const query = db.read.select('*')
      .from('axk_card')
      .where('wallet_id', data.wallet_id)
      .where('card_number', data.card_number);   
      return query;
  };

  exports.getUserCards = async (data) => {
    const query = db.read.select('*')
      .from('axk_card')
      .where('wallet_id', data.wallet_id);  
      return query;
  };
  
  exports.checkCard = async (data) => {
    const query = db.read.select('axk_card.id', 'axk_card.expiry')
      .from('axk_card')
      .where('wallet_id', data.wallet_id)
      .where('card_number', data.card_number);   
      return query;
  };

  exports.updateCard = async (data) => {
    data.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
    const toBeUpdated = {};
    const canBeUpdated = ['name', 'state', 'balance'];
    for (let i in data) {
      if (canBeUpdated.indexOf(i) > -1) {
        toBeUpdated[i] = data[i];
      }
    }
    const query = db.write('axk_card')
      .where('card_number', data.card_number)
      .update(toBeUpdated);
  
    console.info("query -->", query.toQuery())
    return query;
  };

  exports.cardBalance = async (data) => {
    const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    const query = db.write('axk_card_balance').insert({
      card_id: data.card_number,
      currency: data.currency,
      amount: data.amount || 0,
      created_at: createdAt,
      updated_at: createdAt
    });
    console.info("query -->", query.toQuery())
    return query;
  };
  

  exports.getCardBalance = async (data) => {
    const query = db.read.select('*')
      .from('axk_card_balance')
      .where('card_id', data.card_number)
      .where('currency', data.currency);   
      return query;
  };

  exports.checkCardBalance = async (data) => {
    const query = db.read.select('*')
      .from('axk_card_balance')
      .where('card_id', data);   
      return query;
  };


  exports.updateCardBalance = async (data) => {
    const query = db.write('axk_card_balance')
      .where('card_id', data.card_number)
      .where('currency', data.currency)
      .update({
        amount : data.amount,
        updated_at : moment().format('YYYY-MM-DD HH:mm:ss')
      });
    console.info("query -->", query.toQuery())
    return query;
  };

