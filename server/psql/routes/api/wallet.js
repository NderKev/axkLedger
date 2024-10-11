const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const walletController = require('../../controllers/wallet');
const {validateToken, validateAdmin} = require('../../middleware/auth');

router.post(
  '/wallet',
  [
    //check('wallet_id', 'Wallet id is required').not().isEmpty(),
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
  '/admin',
  [
    //check('wallet_id', 'Wallet id is required').not().isEmpty(),
    check('mnemonic', 'Please include a mnemonic').not().isEmpty(),
    check('passphrase', 'Please include a passphrase').not().isEmpty(),
    check('wif', 'Wif is required').not().isEmpty(),
    check('address', 'Please include an address').not().isEmpty(),
    check('xpub', 'Please include xpub').not().isEmpty(),
    check('xpriv', 'Please include xpriv').not().isEmpty(),
  ],
  validateAdmin,
  walletController.createWallet
);

router.post(
  '/evm',
  [

    //check('wallet_id', 'Please include a wallet id').not().isEmpty(),
    check('address', 'Please include an address').not().isEmpty()
  
  ],
  validateToken,
  walletController.createEVM
);

router.post(
  '/admin/evm',
  [
    check('address', 'Please include an address').not().isEmpty()
  
  ],
  validateAdmin,
  walletController.createEVM
);

router.post(
  '/pass',
  [
    check('passphrase', 'Please include a passphrase').not().isEmpty()
  
  ],
  validateToken,
  walletController.updateWalletPassphrase
);

router.post(
  '/admin/pass',
  [
    check('pin', 'Please include a passphrase').not().isEmpty()
  
  ],
  validateAdmin,
  walletController.updateWalletPassphrase
);

router.get(
  '/wallet',
  validateToken,
  walletController.getWallet
);

router.get(
  '/admin/wallet',
  validateAdmin,
  walletController.getWallet
);

//getCurrentWif

router.get(
  '/wifs',
  validateToken,
  walletController.getWifs
);

router.get(
  '/admin/wifs',
  validateAdmin,
  walletController.getWifs
);

router.get(
  '/evm',
  validateToken,
  walletController.getEVM
);


router.get(
  '/admin/evm',
  validateAdmin,
  walletController.getEVM
);

router.get(
  '/btc',
  validateToken,
  walletController.getBTC
);

router.get(
  '/admin/btc',
  validateAdmin,
  walletController.getBTC
);

router.post(
  '/update/btc',
  [
    //check('wallet_id', 'Please include a wallet id').not().isEmpty(),
    check('wif', 'Wif is required').not().isEmpty(),
    check('address', 'Please include an address').not().isEmpty(),
    check('index', 'Please include an index').not().isEmpty(),
  ],
  validateToken,
  walletController.updateBTC
);

router.post(
  '/admin/update/btc',
  [
    check('wif', 'Wif is required').not().isEmpty(),
    check('address', 'Please include an address').not().isEmpty(),
    check('index', 'Please include an index').not().isEmpty(),
  ],
  validateAdmin,
  walletController.updateBTC
);

router.post(
  '/xrp',
  [
    //check('wallet_id', 'Please include a wallet id').not().isEmpty(),
    check('pubKey', 'Public Key is required').not().isEmpty(),
    check('privKey', 'Please include Private Key').not().isEmpty(),
    check('address', 'Please include xrp address').not().isEmpty(),
    check('balance', 'Please include xrp balance').not().isEmpty()
  ],
  validateToken,
  walletController.createXRP
);

router.post(
  '/admin/xrp',
  [
    check('pubKey', 'Public Key is required').not().isEmpty(),
    check('privKey', 'Please include Private Key').not().isEmpty(),
    check('address', 'Please include xrp address').not().isEmpty(),
    check('balance', 'Please include xrp balance').not().isEmpty()
  ],
  validateAdmin,
  walletController.createXRP
);

router.post(
  '/balance',
  [
    //check('wallet_id', 'Wallet ID is required').not().isEmpty(),
    check('address', 'Please include an address').not().isEmpty(),
    check('crypto', 'Please include crypto').not().isEmpty(),
    check('balance', 'Please include a balance').not().isEmpty()
  ],
  validateToken,
  walletController.cryptoBalance
);


router.post(
  '/admin/balance',
  [
    check('address', 'Please include an address').not().isEmpty(),
    check('crypto', 'Please include crypto').not().isEmpty(),
    check('balance', 'Please include a balance').not().isEmpty()
  ],
  validateAdmin,
  walletController.cryptoBalance
);

router.post(
  '/evm/balance',
  [
    //check('wallet_id', 'Wallet ID is required').not().isEmpty(),
    check('address', 'Please include an address').not().isEmpty(),
    check('crypto', 'Please include crypto').not().isEmpty(),
    check('balance', 'Please include a balance').not().isEmpty()
  ],
  validateToken,
  walletController.evmBalance
);

router.post(
  '/admin/evm/balance',
  [
    check('address', 'Please include an address').not().isEmpty(),
    check('crypto', 'Please include crypto').not().isEmpty(),
    check('balance', 'Please include a balance').not().isEmpty()
  ],
  validateAdmin,
  walletController.evmBalance
);

router.get(
  '/balance',
  validateToken,
  walletController.getBalance
);


router.get(
  '/admin/balance',
  validateToken,
  walletController.getBalance
);

router.get(
  '/evm/balance',
  validateToken,
  walletController.getEvmBalance
);

router.get(
  '/admin/evm/balance',
  validateAdmin,
  walletController.getEvmBalance
);

router.put(
  '/balance',
  [
    check('address', 'Please include an address').not().isEmpty(),
    check('crypto', 'Please include crypto').not().isEmpty(),
    check('balance', 'Please include a balance').not().isEmpty(),
    check('usd', 'Please include usd balance').not().isEmpty(),
  ],
  validateToken,
  walletController.updateBalance
);

router.put(
  '/admin/balance',
  [
    check('address', 'Please include an address').not().isEmpty(),
    check('crypto', 'Please include crypto').not().isEmpty(),
    check('balance', 'Please include a balance').not().isEmpty(),
    check('usd', 'Please include usd balance').not().isEmpty(),
  ],
  validateAdmin,
  walletController.updateBalance
);

router.put(
  '/evm/balance',
  [
    check('address', 'Please include an address').not().isEmpty(),
    check('crypto', 'Please include crypto').not().isEmpty(),
    check('balance', 'Please include a balance').not().isEmpty(),
    check('usd', 'Please include usd balance').not().isEmpty(),
  ],
  validateToken,
  walletController.updateEvmBalance
);

router.put(
  '/admin/evm/balance',
  [
    check('address', 'Please include an address').not().isEmpty(),
    check('crypto', 'Please include crypto').not().isEmpty(),
    check('balance', 'Please include a balance').not().isEmpty(),
    check('usd', 'Please include usd balance').not().isEmpty(),
  ],
  validateAdmin,
  walletController.updateEvmBalance
);

module.exports = router;