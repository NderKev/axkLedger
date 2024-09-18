const config = require('../config');
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    wallet_id: {
    type: String,
    required: true,
      },
    address: {
      type: String,
      required: true,
    },
    tx_hash: {
      type: String,
      required: true,
      unique: true,
    },
    mode: {
      type: String,
      enum: ['axk', 'btc', 'eth', 'lisk', 'usdc', 'usdt', 'xrp'],
      required : true,
    },
    type: {
      type: String,
      enum: ['debit', 'credit'],
      required : true,
    },
    to: {
        type: String,
        required : true,
      },
    status: {
        type: String,
        enum: ['pending', 'complete', 'failed'],
        default: 'pending',
      },
    value: {
      type: mongoose.Types.Decimal128,
      required : true,
    },
    fiat: {
      type: Number,
      default : 0,
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
  
  module.exports = Transaction = mongoose.model('transaction', TransactionSchema);