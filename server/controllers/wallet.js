const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { validationResult } = require('express-validator');
const {isAddress} = require("web3-validator");
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const BTC = require('../models/BTC');
const Wif = require('../models/Wif');
const EVM = require('../models/EVM');

// @route   POST api/wallet
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
        console.log(btc);
        let wallet = 
        (await Wallet.findOne({ wallet_id }));
        console.log(wallet);
        let wf = 
        (await Wif.findOne({ wif }));
        console.log(wf);
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
      wf = new Wif({wallet_id, wif, address});
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

// @route   GET api/wallet
// @desc    Get user by wallet id
// @access  Public

exports.getWallet = async (req, res) => {
  try {
    let wallet_id = req.body.wallet_id;
    const wallet = await Wallet.findOne({wallet_id : wallet_id}).select('-wallet_id');
    return res.status(200).json(wallet);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Internal server error get wallet');
  }
};

exports.getWif = async (req, res) => {
  try {
    let wallet_id = req.body.wallet_id;
    const wallet = await Wif.findMany({wallet_id : wallet_id}).select('-wallet_id');
    return res.status(200).json(wallet);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Internal server error get wif');
  }
};

exports.getBTC = async (req, res) => {
  try {
    let wallet_id = req.body.wallet_id;
    const btc = await BTC.findOne({wallet_id : wallet_id}).select('-wallet_id');
    return res.status(200).json(btc);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Internal server error get btc');
  }
};

exports.getEVM = async (req, res) => {
  try {
    let wallet_id = req.body.wallet_id;
    const evm = await EVM.findOne({wallet_id : wallet_id}).select('-wallet_id');
    return res.status(200).json(evm);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Internal server error get evm');
  }
};

exports.updateBTC = async (req, res) => {
  try {
    let {wallet_id, wif, address, index } = req.body;
    const btc = await BTC.updateOne({wallet_id : wallet_id}, { $set: { wif: wif}});
    const addr = await BTC.updateOne({wallet_id : wallet_id}, { $set: {address: address}});
    const indx = await BTC.updateOne({wallet_id : wallet_id}, { $set: {index: index}});
    const response = {
      wif : btc,
      address : addr,
      index : indx
    };
    return res.status(200).json(response);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Internal server error update btc');
  }
};


/**
 * const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  age: Number,
});

const User = mongoose.model('User', userSchema);

async function findOneUser() {
  try {
    const user = await User.findOne({ name: 'John Doe' });
    if (user) {
      console.log('User found:', user);
    } else {
      console.log('User not found');
    }
  } catch (err) {
    console.error('Error finding user:', err);
  }
} 

findOneUser();
**/

/** 
 * const { MongoClient } = require('mongodb');

async function updateUser() {
  const url = 'mongodb://localhost:27017';
  const dbName = 'your_database_name';
  
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  
  try {
    await client.connect();
    console.log('Connected to the database');
    
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    
    const result = await usersCollection.updateOne(
      { name: 'John Doe' }, // Filter
      { $set: { age: 30 } } // Update
    );
    console.log('Update result:', result);
  } catch (err) {
    console.error('Error updating user:', err);
  } finally {
    await client.close();
  }
}

updateUser();
 **/

