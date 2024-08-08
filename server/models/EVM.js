const config = require('../config');
const mongoose = require('mongoose');

const EVMSchema = new mongoose.Schema({
  wallet_id: {
    type: String,
    required: true,
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

module.exports = EVM = mongoose.model('evm', EVMSchema);