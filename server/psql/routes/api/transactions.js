const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const transactions = require('../../controllers/transactions');
const {validateToken} = require('../../middleware/auth');

router.get('/', validateToken, transactions.getTransactionsByUser);
router.get('/deposit', validateToken, transactions.getUserDeposits);
router.get('/transfer', validateToken, transactions.getUserTransfers);
router.get('/:hash', validateToken, [
    check('hash', 'transaction hash is required').isHexadecimal().not().isEmpty(),
  ],  transactions.getTransactionByHash);
router.get('/hash', validateToken, [
    check('tx_hash', 'transaction hash is required').isHexadecimal().not().isEmpty(),
  ],  transactions.getUserTransactionByHash);
router.get('/:mode', validateToken, [
    check('mode', 'transaction mode is required').isString().not().isEmpty(),
  ],  transactions.getTransactionsByMode);
router.get('/mode', validateToken, [
    check('mode', 'transaction mode is required').isString().not().isEmpty(),
  ],  transactions.getUserTransactionByHash);

router.post(
    '/',
    [
      check('wallet_id', 'Wallet id is required').isAlphanumeric().not().isEmpty(),
      check('address', 'Please include an address').not().isEmpty(),
      check('tx_hash', 'Please include a transaction hash').not().isEmpty(),
      check('mode', 'Please include the crypto mode').isString().not().isEmpty(),
      check('value', 'Value is required').isInt().not().isEmpty(), 
      check('fiat', 'Please include fiat value').isFloat().not().isEmpty(),
    ],
    validateToken,
    transactions.createTransaction
  );
  
router.post(
    '/status',
    [
      check('wallet_id', 'Wallet id is required').isAlphanumeric().not().isEmpty(),
      check('tx_hash', 'transaction hash is required').isHexadecimal().not().isEmpty(),
      check('status', 'transaction status is required').isString().not().isEmpty(),
    ],
    validateToken,
    transactions.updateTransactionStatus,
  );

router.post(
    '/hash',
    [ 
      check('value', 'transaction value is required').isNumeric().not().isEmpty(),
      check('tx_hash', 'transaction hash is required').isHexadecimal().not().isEmpty(),
      check('status', 'transaction status is required').isString().not().isEmpty(),
      check('fiat', 'Please include fiat value').isFloat().not().isEmpty(),
    ],
    validateToken,
    transactions.updateTransactionHash,
  );

router.post(
    '/update',
    [ 
      check('value', 'transaction value is required').isNumeric().not().isEmpty(),
      check('tx_hash', 'transaction hash is required').isHexadecimal().not().isEmpty(),
      check('status', 'transaction status is required').isString().not().isEmpty(),
      check('fiat', 'Please include fiat value').isFloat().not().isEmpty(),
      check('type', 'Please include transaction type').isFloat().not().isEmpty(),
    ],
    validateToken,
    transactions.updateTransaction,
  ); 


module.exports = router;