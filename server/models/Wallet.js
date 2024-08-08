const config = require('../config');
const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
  wallet_id: {
    type: String,
    required: true,
    unique: true,
  },
  mnemonic: {
    type: String,
    required: true,
    unique: true,
  },
  passphrase: {
    type: String,
    required: true,
  },
  kyc: {
    type: String,
    enum: ['verified', 'pending', 'started', 'failed'],
    default: 'pending',
  },
  total: {
    type: mongoose.Types.Decimal128,
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

module.exports = Wallet = mongoose.model('wallet', WalletSchema);