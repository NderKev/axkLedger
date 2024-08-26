const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const walletController = require('../../controllers/wallet');
const {validateToken} = require('../../middleware/auth');

router.post(
  '/wallet',
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
  walletController.createWallet
);

router.post(
  '/evm',
  [

    check('wallet_id', 'Please include a wallet id').not().isEmpty(),
    check('address', 'Please include an address').not().isEmpty()
  
  ],
  validateToken,
  walletController.createEVM
);

router.post(
  '/pass',
  [

    check('wallet_id', 'Please include a wallet id').not().isEmpty(),
    check('passphrase', 'Please include a passphrase').not().isEmpty()
  
  ],
  validateToken,
  walletController.updateWalletPassphrase
);

router.get(
  '/wallet',
  [
    check('wallet_id', 'Please include a wallet id').not().isEmpty()
  ],
  validateToken,
  walletController.getWallet
);

//getCurrentWif

router.get(
  '/wifs',
  [
    check('wallet_id', 'Please include a wallet id').not().isEmpty()
  ],
  validateToken,
  walletController.getWifs
);

router.get(
  '/evm',
  [
    check('wallet_id', 'Please include a wallet id').not().isEmpty()
  ],
  validateToken,
  walletController.getEVM
);

router.get(
  '/btc',
  [
    check('wallet_id', 'Please include a wallet id').not().isEmpty()
  ],
  validateToken,
  walletController.getBTC
);

router.post(
  '/update/btc',
  [
    check('wallet_id', 'Please include a wallet id').not().isEmpty(),
    check('wif', 'Wif is required').not().isEmpty(),
    check('address', 'Please include an address').not().isEmpty(),
    check('index', 'Please include an index').not().isEmpty(),
  ],
  validateToken,
  walletController.updateBTC
);

router.post(
  '/xrp',
  [
    check('wallet_id', 'Please include a wallet id').not().isEmpty(),
    check('pubKey', 'Public Key is required').not().isEmpty(),
    check('privKey', 'Please include Private Key').not().isEmpty(),
    check('address', 'Please include xrp address').not().isEmpty(),
    check('balance', 'Please include xrp balance').not().isEmpty()
  ],
  validateToken,
  walletController.createXRP
);

router.post(
  '/balance',
  [
    check('wallet_id', 'Wallet ID is required').not().isEmpty(),
    check('address', 'Please include an address').not().isEmpty(),
    check('crypto', 'Please include crypto').not().isEmpty(),
    check('balance', 'Please include a balance').not().isEmpty()
  ],
  validateToken,
  walletController.cryptoBalance
);

module.exports = router;