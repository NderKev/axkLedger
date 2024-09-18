const config = require('../config');
const mongoose = require('mongoose');

const DepositSchema = new mongoose.Schema({
    wallet_id: {
    type: String,
    required: true,
      },
    from: {
      type: String,
      required: true,
    },
    tx_conf: {
      type: String,
      required: true,
      unique: true,
    },
    crypto: {
      type: String,
      enum: ['axk', 'btc', 'eth', 'lisk', 'usdc', 'usdt', 'xrp'],
      required : true,
    },
    account: {
        type: String,
        required : true,
      },
    state: {
        type: String,
        enum: ['pending', 'complete', 'error', 'failed'],
        default: 'pending',
      },
    amount: {
      type: mongoose.Types.Decimal128,
      required : true,
    },
    price: {
        type: mongoose.Types.Decimal128,
        required : true,
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
  
  module.exports = Deposit = mongoose.model('deposit', DepositSchema);