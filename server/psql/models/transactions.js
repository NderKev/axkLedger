const db = require('../models/db');
const moment = require('moment');


exports.getTransactionById = async (id) => {
  const query = db.read.select('*')
  .from('axk_txs')
  .where('id', '=', id);
  return query;
};


exports.getTransactionByWalletId = async (wallet_id) => {
  const query = db.read.select('*')
  .from('axk_txs')
  .where('wallet_id', '=', wallet_id);
  return query;
};

exports.getPendingTxsUser = async (wallet_id) => {
  const query = db.read.select('axk_txs.address', 'axk_txs.tx_hash', 'axk_txs.mode',
   'axk_txs.to', 'axk_txs.value', 'axk_txs.fiat')
  .from('axk_txs')
  .where('wallet_id', '=', wallet_id)
  .where('status', '=', 'pending' );
  return query;
};

exports.getDepositsUser = async (wallet_id) => {
  const query = db.read.select('axk_txs.address', 'axk_txs.tx_hash',
   'axk_txs.to', 'axk_txs.status', 'axk_txs.value', 'axk_txs.fiat')
  .from('axk_txs')
  .where('wallet_id', '=', wallet_id)
  .where('mode', '=', 'debit' );
  return query;
};

exports.getTransfersUser = async (wallet_id) => {
  const query = db.read.select('axk_txs.address', 'axk_txs.tx_hash',
   'axk_txs.to', 'axk_txs.status', 'axk_txs.value', 'axk_txs.fiat')
  .from('axk_txs')
  .where('wallet_id', '=', wallet_id)
  .where('mode', '=', 'credit' );
  return query;
};

exports.getCompletedTxs = async (wallet_id) => {
  const query = db.read.select('axk_txs.address', 'axk_txs.tx_hash', 'axk_txs.mode',
   'axk_txs.to', 'axk_txs.value', 'axk_txs.fiat')
  .from('axk_txs')
  .where('wallet_id', '=', wallet_id)
  .where('status', '=', 'complete' );
  return query;
};

exports.getTransactionByUtx = async (data) => {
  const query = db.read.select('*')
  .from('axk_txs')
  .where('wallet_id', '=', data.wallet_id)
  .where('tx_hash', '=', data.tx_hash);
  return query;
};

exports.getTransactionByHash = async (hash) => {
  const query = db.read.select('*')
  .from('axk_txs')
  .where('tx_hash', '=', hash);
  return query;
};

exports.getAllTxs = async () => {
  const query = db.read.select('*')
  .from('axk_txs');

  return query;
};

exports.getTxsByMode = async (mode) => {
  const query = db.read.select('*')
  .from('axk_txs')
  .where('mode', '=', mode);
  return query;
};

exports.createTransaction = async (data) => {
  const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
  const query = db.write('axk_txs').insert({
    wallet_id: data.wallet_id,
    address: data.address,
    tx_hash: data.tx_hash,
    mode: data.mode,
    type: data.type || null,
    to: data.to,
    status: data.status || "pending",
    value: data.value || 0,
    fiat: data.fiat || 0,
    created_at : createdAt,
    updated_at : createdAt
  });
  console.info("query -->", query.toQuery())
  return query;
};

exports.updateTransaction = async (data) => {
  const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
  const query = db.write('axk_txs').update({
    status : data.status,
    updated_at : createdAt
  })
  .where('id', '=', data.id);

  console.info("query -->", query.toQuery())
  return query;
};

exports.updateTransactionHash = async (data) => {
  const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
  const query = db.write('axk_txs').update({
    status : data.data.status,
    value : data.value,
    fiat : data.fiat,
    updated_at : createdAt
  })
  .where('tx_hash', '=', data.tx_hash);

  console.info("query -->", query.toQuery())
  return query;
};

exports.updateStatus = async (data) => {
  const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
  const query = db.write('axk_txs').update({
    status : data.status,
    updated_at : createdAt
  })
  .where('tx_hash', '=', data.tx_hash);

  console.info("query -->", query.toQuery())
  return query;
};
