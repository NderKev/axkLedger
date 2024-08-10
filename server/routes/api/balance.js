const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {validateToken} = require('../../middleware/auth');

const { addBalance, getBalance } = require('../../controllers/balance');

router.post(
    '/',
    [
      check('wallet_id', 'Wallet ID is required').not().isEmpty(),
      check('address', 'Please include a mnemonic').not().isEmpty(),
      check('balance', 'Please include a passphrase').not().isEmpty()
    ],
    validateToken,
    addBalance
  );

  router.get('/', validateToken, getBalance);

  module.exports = router;