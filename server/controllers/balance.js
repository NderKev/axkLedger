const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const { validationResult } = require('express-validator');
const config = require('../config');
const {isAddress} = require("web3-validator");
const User = require('../models/User');
const Balance = require('../models/Balance');


exports.addBalance = async (req, res) => {
    const errors = validationResult(req);

  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

  console.log(req.body.crypto);

  if (req.body.crypto !== "btc" && req.body.crypto !== "xrp"){
   const validAddress = isAddress(req.body.address);
   if (!validAddress || validAddress === 'null'|| typeof validAddress === 'undefined'){
    return res.status(401).json({ msg: 'Invalid address!' });
   }
  }
    const { wallet_id, crypto, address, balance, usd } = req.body;
  
    try {
      let bal =
        (await Balance.findOne({ address }));
      let user = 
      (await User.findOne({ wallet_id }));
      if (bal || !user) { 
        return res.status(400).json({
          errors: [
            {
              msg: 'Invalid credentials add balance',
            },
          ],
        });
      }
  
      bal = new Balance({ wallet_id, crypto, address, balance, usd });
  
      //const salt = await bcrypt.genSalt(10);
  
      //meta.passphrase = await bcrypt.hash(passphrase, salt);
  
      await bal.save();
      res.json({ address : address, balance : balance});
     /** try {
        await sendEmail(user.email, WelcomeMail(user.name));
      } catch (error) {
        console.log(error);
      } 
  
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
      ); **/
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
      return res.status(500).json({ msg: 'Internal server error add balance' });
    }
};



exports.getBalance = async (req, res) => {
    try {
      let address = req.body.address;
      const balance = await Balance.findOne({address : address}).select('-address');
      return res.status(200).json(balance);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Internal server error get balance');
    }
  };

  exports.updateBalance = async (req, res) => {
    try {
      let {wallet_id, address, balance, usd, status } = req.body;
      let user = 
      (await User.findOne({ wallet_id }));
      if (!user) { 
        return res.status(400).json({
          errors: [
            {
              msg: 'Invalid credentials update balance',
            },
          ],
        });
      }
      
      const bal = await Balance.updateOne({address : address}, { $set: { balance: balance}});
      const _usd = await Balance.updateOne({address : address}, { $set: {usd: usd}});
      const _status = await Balance.updateOne({address : address}, { $set: {status: status}});
      const response = {
        balance : bal,
        usd : _usd,
        status : _status
      };
      return res.status(200).json(response);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Internal server error update balance');
    }
  };


  