const config = require('../../config');
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  wallet_id: {
    type: String,
    required: true,
    unique: true,
  },
  kyc: {
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

module.exports = User = mongoose.model('user', UserSchema);
