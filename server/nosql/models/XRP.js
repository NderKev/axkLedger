const config = require('../../config');
const mongoose = require('mongoose');

const XRPSchema = new mongoose.Schema({
  wallet_id: {
    type: String,
    required: true
  },
  pubKey: {
    type: String,
    required: true,
    unique: true,
  },
  privKey: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: String,
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    default: 0,
    required: true,
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

module.exports = BTC = mongoose.model('xrp', XRPSchema);