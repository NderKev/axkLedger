const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {validateToken} = require('../../middleware/auth');

const { addBalance, getBalance, updateBalance } = require('../../controllers/balance');

router.post(
    '/',
    [
      check('wallet_id', 'Wallet ID is required').not().isEmpty(),
      check('address', 'Please include a mnemonic').not().isEmpty(),
      check('crypto', 'Please include a currency').not().isEmpty(),
      check('balance', 'Please include a passphrase').not().isEmpty(),
      check('usd', 'Please include a passphrase').not().isEmpty()
    ],
    validateToken,
    addBalance
  );

  router.get('/', validateToken, getBalance);

  router.post(
    '/update',
    [
      check('wallet_id', 'Wallet ID is required').not().isEmpty(),
      check('address', 'Please include a mnemonic').not().isEmpty(),
      //check('crypto', 'Please include a currency').not().isEmpty(),
      check('balance', 'Please include a passphrase').not().isEmpty(),
      check('usd', 'Please include a passphrase').not().isEmpty()
    ],
    validateToken,
    updateBalance
  );

  module.exports = router;