const db = require('../models/db');
const moment = require('moment');

exports.createConsignment = async (data) => {
    const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    const query = db.write('axk_sc_consignments').insert({
      wallet_id: data.wallet_id,
      farmer: data.farmer,
      owner: data.owner,
      p_hash: data.consignment_hash,
      tx_hash: data.tx_hash,
      lot_number: data.lot_number,
      storage_date: data.storage_date,
      type: "consignment",
      weight: data.weight ,
      quantity : data.quantity,
      created_at: createdAt,
      updated_at: createdAt
    });
    console.info("query -->", query.toQuery())
    return query;
  };

  exports.createProduce = async (data) => {
    const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    const query = db.write('axk_sc_products').insert({
      wallet_id: data.wallet_id,
      farmer: data.farmer,
      owner: data.owner,
      produce_hash: data.produce_hash,
      tx_hash: data.tx_hash,
      lot_number: data.lot_number,
      creation_date: data.creation_date,
      type: "product",
      produce_type: data.produce_type,
      created_at: createdAt,
      updated_at: createdAt
    });
    console.info("query -->", query.toQuery())
    return query;
  };

  exports.sellProduce = async (data) => {
    const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    const query = db.write('axk_sc_sell').insert({
      wallet_id: data.wallet_id,
      farmer: data.farmer,
      buyer: data.buyer,
      tx_hash: data.tx_hash,
      hash: data.hash,
      timestamp: data.timestamp,
      amount: data.amount,
      price: data.price,
      index: data.index,
      created_at: createdAt,
      updated_at: createdAt
    });
    console.info("query -->", query.toQuery())
    return query;
  };

  exports.checkConsignment = async (data) => {
    const query = db.read.select('axk_sc_consignments.*' )
      .from('axk_sc_consignments')
      .where('farmer', data.farmer)
      .where('p_hash', data.hash)
      .where('tx_hash', data.p_hash);   
      return query;
  };


  exports.checkProduce = async (data) => {
    const query = db.read.select('axk_sc_products.*' )
      .from('axk_sc_products')
      .where('farmer', data.farmer)
      .where('produce_hash', data.hash);
      //.where('produce_type', data.type);   
      return query;
  };

  exports.checkProduceHash = async (data) => {
    const query = db.read.select('axk_sc_products.*' )
      .from('axk_sc_products')
      .where('farmer', data)
      .orWhere('produce_hash', data);
      //.where('produce_type', data.type);   
      return query;
  };

  exports.checkProduceExists = async (data) => {
    const query = db.read.select('axk_sc_products.*' )
      .from('axk_sc_products')
      .where('farmer', data.farmer)
      .where('produce_type', data.produce_type);   
      return query;
  };

  exports.updateProduct = async (data) => {
    data.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
    const toBeUpdated = {};
    const canBeUpdated = ['owner', 'tx_hash', 'type'];//['name','description', 'seller_id', 'warehouse_id','updated_at', 'quantity', 'price', 'currency', 'one_time_limit', 'picture'];
    for (let i in data) {
      if (canBeUpdated.indexOf(i) > -1) {
        toBeUpdated[i] = data[i];
      }
    }
    const query = db.write('axk_sc_products')
      .where('produce_hash', data.hash)
      .update(toBeUpdated);
  
    console.info("query -->", query.toQuery())
    return query;
  };



  exports.updateConsignment = async (data) => {
    data.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
    const toBeUpdated = {};
    const canBeUpdated = ['owner', 'tx_hash', 'type', 'weight', 'quantity'];
    for (let i in data) {
      if (canBeUpdated.indexOf(i) > -1) {
        toBeUpdated[i] = data[i];
      }
    }
    const query = db.write('axk_sc_consignments')
      .where('p_hash', data.hash)
      .update(toBeUpdated);
  
    console.info("query -->", query.toQuery())
    return query;
  };

  