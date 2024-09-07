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