const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { validationResult } = require('express-validator');
const {isAddress} = require("web3-validator");
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
// @route   POST api/tx
// @desc    add transaction
// @access  Public
exports.addTransaction = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
   const validAddress = isAddress(req.body.address);
   if (!validAddress || validAddress === 'null'|| typeof validAddress === 'undefined'){
    return res.status(401).json({ msg: 'Invalid address!' });
   }
    const { address, tx_hash, type, to, value } = req.body;
  
    try {
      let transaction =
        (await Transaction.findOne({ tx_hash }));
      let wallet = 
      (await Wallet.findOne({ address }));
      if (transaction || !wallet) {
        return res.status(400).json({
          errors: [
            {
              msg: 'Invalid credentials add transaction',
            },
          ],
        });
      }
  
      transaction = new Transaction({ address, tx_hash, type, to, value });
  
      //const salt = await bcrypt.genSalt(10);
  
      //meta.passphrase = await bcrypt.hash(passphrase, salt);
  
      await transaction.save();
  
     /** try {
        await sendEmail(user.email, WelcomeMail(user.name));
      } catch (error) {
        console.log(error);
      } **/
  
      const payload = {
        transaction : {
          id: transaction.id,
        },
      }; 

      jwt.sign(
        payload,
        config.JWT_SECRET,
        { expiresIn: config.JWT_TOKEN_EXPIRES_IN },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        },
      );
     /** jwt.verify(
        req.body.token,
        config.JWT_SECRET,
        (err, decoded) => {
          if (err) throw err;
          var expiration = decoded.exp;
          var timeNow = Math.floor(Date.now() / 1000);
          if (expiration < timeNow ){
            return res.status(400).json({
                errors: [
                  {
                    msg: 'expired token',
                  },
                ],
              });
          }
          return res.json({ token });
        },
      );**/
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ msg: 'Internal server error add transaction' });
    }
  };

  exports.getTransaction = async (req, res) => {
    try {
      const transaction = await Transaction.findById(req.body.transaction_id).select('-tx_hash');
      return res.status(200).json(transaction);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Internal server error get transaction');
    }
  };