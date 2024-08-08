const config = require('../config');
const mongoose = require('mongoose');

const BalanceSchema = new mongoose.Schema({
  wallet_id: {
    type: String,
    required: true,
  },
  currency : {
    type: String,
    enum: ['axk', 'btc', 'eth', 'lisk', 'usdc', 'usdt', 'xrp'],
    required : true,
  },
  address: {
    type: String,
    required: true,
    unique: true,
  },
  balance: {
    type: mongoose.Types.Decimal128,
    default : 0,
  },
  usd: {
    type: mongoose.Types.Decimal128,
    default : 0,
  },
  status : {
    type: String,
    enum: ['complete', 'pending', 'refunded', 'failed'],
    default: 'pending',
  },
  created_at : {
    type: Date,
    default: Date.now,
  },
  updated_at : {
    type: Date,
    default: Date.now,
  },
});

module.exports = Balance = mongoose.model('balance', BalanceSchema);