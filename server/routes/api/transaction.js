const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
//const {} = require('../../validators/address');
const {validateTokenTransaction} = require('../../middleware/auth');

const {  addTransaction, getCurrentTransaction } = require('../../controllers/transaction');

router.get('/', validateTokenTransaction, getCurrentTransaction);

router.post(
    '/',
    [
      check('address', 'Please include an address').exists(),
      check('tx_hash', 'tx_hash is required').exists(),
      check('type', 'Please include the type').exists(),
      check('to', 'to is required').exists(),
      check('value', 'value is required').exists(),
    ],
    addTransaction,
  );

 
  module.exports = router;