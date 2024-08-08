const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { validationResult } = require('express-validator');
const {isAddress} = require("web3-validator");
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const Balance = require('../models/Balance');
const BTC = require('../models/BTC');
const WF = require('../models/Wif');
const EVM = require('../models/EVM');

// @route   POST api/meta
// @desc    Register Wallet
// @access  Public
exports.createWallet = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
   /** const validAddress = isAddress(req.body.address);
   if (!validAddress || validAddress === 'null'|| typeof validAddress === 'undefined'){
    return res.status(401).json({ msg: 'Invalid address!' });
   } **/
    const { wallet_id, mnemonic, passphrase } = req.body;
  
    try {
      let wallet =
        (await Wallet.findOne({ wallet_id }));
        let user = 
        (await User.findOne({ wallet_id }));
      if (wallet || !user) {
        return res.status(400).json({
          errors: [
            {
              msg: 'Invalid wallet creation credentials',
            },
          ],
        });
      }
  
      wallet = new Wallet({ wallet_id, mnemonic, passphrase });
  
      const salt = await bcrypt.genSalt(10);
  
      wallet.passphrase = await bcrypt.hash(passphrase, salt);
  
      await wallet.save();

      return res.json({ wallet : wallet_id });
  
     /** try {
        await sendEmail(user.email, WelcomeMail(user.name));
      } catch (error) {
        console.log(error);
      } 
  
      const payload = {
        wallet : {
          id: wallet.id,
        },
      };
  
      jwt.sign(
        payload,
        config.JWT_SECRET,
        { expiresIn: config.JWT_TOKEN_EXPIRES_IN },
        (err, token) => {
          if (err) throw err;
          return res.json({ token });
        },
      ); **/
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ msg: 'Internal server error wallet create' });
    }
  };

exports.createBTC = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
   /** const validAddress = isAddress(req.body.address);
   if (!validAddress || validAddress === 'null'|| typeof validAddress === 'undefined'){
    return res.status(401).json({ msg: 'Invalid address!' });
   } **/
    const { wallet_id, wif, address, xpub, xpriv } = req.body;
  
    try {
      let btc =
        (await BTC.findOne({ wallet_id }));
        let wallet = 
        (await Wallet.findOne({ wallet_id }));
        let wf = 
        (await WF.findOne({ wif }));
      if (btc || wf ||!wallet ) {
        return res.status(400).json({
          errors: [
            {
              msg: 'Invalid credentials create BTC Wallet',
            },
          ],
        });
      }
  
      btc = new BTC({ wallet_id, wif, address, xpub, xpriv });
      wf = new WF({wallet_id, wif, address});
      //const salt = await bcrypt.genSalt(10);
  
      //wallet.passphrase = await bcrypt.hash(passphrase, salt);
  
      await btc.save();
      await wf.save();
      return res.json({ btc : address });
     /** try {
        await sendEmail(user.email, WelcomeMail(user.name));
      } catch (error) {
        console.log(error);
      } 
  
      const payload = {
        wallet : {
          id: wallet.id,
        },
      };
  
      jwt.sign(
        payload,
        config.JWT_SECRET,
        { expiresIn: config.JWT_TOKEN_EXPIRES_IN },
        (err, token) => {
          if (err) throw err;
          return res.json({ token });
        },
      ); **/
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ msg: 'Internal server error create btc wallet' });
    }
  };

exports.createEVM = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const validAddress = isAddress(req.body.address);
   if (!validAddress || validAddress === 'null'|| typeof validAddress === 'undefined'){
    return res.status(401).json({ msg: 'Invalid address!' });
   } 
    const { wallet_id, address} = req.body;
  
    try {
      let evm =
        (await EVM.findOne({ address }));
        let wallet = 
        (await Wallet.findOne({ wallet_id }));
      if (evm || !wallet) {
        return res.status(400).json({
          errors: [
            {
              msg: 'Invalid credentials create EVM Wallet',
            },
          ],
        });
      }
  
      evm = new EVM({ wallet_id, address});
  
      //const salt = await bcrypt.genSalt(10);
  
      //wallet.passphrase = await bcrypt.hash(passphrase, salt);
  
      await evm.save();
      return res.json({ evm : address });
  
     /** try {
        await sendEmail(user.email, WelcomeMail(user.name));
      } catch (error) {
        console.log(error);
      } 
  
      const payload = {
        wallet : {
          id: wallet.id,
        },
      };
  
      jwt.sign(
        payload,
        config.JWT_SECRET,
        { expiresIn: config.JWT_TOKEN_EXPIRES_IN },
        (err, token) => {
          if (err) throw err;
          return res.json({ token });
        },
      ); **/
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ msg: 'Internal server error create evm wallet' });
    }
  };


  