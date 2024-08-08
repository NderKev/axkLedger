const config = require('../config');
const mongoose = require('mongoose');

const WifSchema = new mongoose.Schema({
  wallet_id: {
    type: String,
    required: true,
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
  created_at : {
    type: Date,
    default: Date.now,
  },
  updated_at : {
    type: Date,
    default: Date.now,
  },
});

module.exports = Wif = mongoose.model('wif', WifSchema);