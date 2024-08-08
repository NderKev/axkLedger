const config = require('../config');
const mongoose = require('mongoose');

const BTCSchema = new mongoose.Schema({
  wallet_id: {
    type: String,
    required: true,
    unique: true,
  },
  wif: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: String,
    required: true,
    unique: true,
  },
  index: {
    type: Number,
    default: 0,
  },
  xpub: {
    type: String,
    required: true,
    unique: true,
  },
  xpriv: {
    type: String,
    required: true,
    unique: true,
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

module.exports = BTC = mongoose.model('btc', BTCSchema);