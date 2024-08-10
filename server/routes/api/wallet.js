const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { createWallet, createBTC, createEVM, getWallet, getWif, getEVM, getBTC, updateBTC } = require('../../controllers/wallet');
const {validateToken} = require('../../middleware/auth');

router.post(
  '/crypto',
  [
    check('wallet_id', 'Wallet ID is required').not().isEmpty(),
    check('mnemonic', 'Please include a mnemonic').not().isEmpty(),
    check('passphrase', 'Please include a passphrase').not().isEmpty()
  ],
  validateToken,
  createWallet
);

router.post(
  '/btc',
  [
    check('wallet_id', 'Wallet id is required').not().isEmpty(),
    check('mnemonic', 'Please include a mnemonic').not().isEmpty(),
    check('passphrase', 'Please include a passphrase').not().isEmpty(),
    check('wif', 'Wif is required').not().isEmpty(),
    check('address', 'Please include an address').not().isEmpty(),
    check('xpub', 'Please include xpub').not().isEmpty(),
    check('xpriv', 'Please include xpriv').not().isEmpty(),
  ],
  validateToken,
  createBTC
);

router.post(
  '/evm',
  [

    check('wallet_id', 'Please include a wallet id').not().isEmpty(),
    check('address', 'Please include an address').not().isEmpty()
  
  ],
  validateToken,
  createEVM
);

router.post(
  '/get/wallet',
  [
    check('wallet_id', 'Please include a wallet id').not().isEmpty()
  ],
  validateToken,
  getWallet
);

//getCurrentWif

router.post(
  '/wif',
  [
    check('wallet_id', 'Please include a wallet id').not().isEmpty()
  ],
  validateToken,
  getWif
);

router.post(
  '/get/evm',
  [
    check('wallet_id', 'Please include a wallet id').not().isEmpty()
  ],
  validateToken,
  getEVM
);

router.post(
  '/get/btc',
  [
    check('wallet_id', 'Please include a wallet id').not().isEmpty()
  ],
  validateToken,
  getBTC
);

router.post(
  '/update',
  [
    check('wallet_id', 'Please include a wallet id').not().isEmpty(),
    check('wif', 'Wif is required').not().isEmpty(),
    check('address', 'Please include an address').not().isEmpty(),
    check('index', 'Please include an index').not().isEmpty(),
  ],
  validateToken,
  updateBTC
);

module.exports = router;