const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const users = require('../models/users');
const CryptoJS = require("crypto-js");
const walletModel = require('../models/wallet');
const { hdkey, Wallet } = require('@ethereumjs/wallet');
const pinHash = require('sha256');

exports.getUser = async (req, res) => {
    try {
      const wallet_id  = req.user.wallet_id;
      console.log(wallet_id);
      const user = await users.getDetailsByWalletId(wallet_id);
      return res.status(200).json(user);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Internal server error get user');
    }
  };

exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { email, password } = req.body;
   
    try {
      const user = await users.getUserDetailsByEmail(email);
      console.log(user);
      if (!user && !user.length) {
        return res.status(400).json({ errors: [{ msg: 'User not registered yet' }] });
      }
  
      const isMatch = await bcrypt.compare(String(password), user[0].password);
  
      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials login user' }] });
      }
      const isFlagged = await users.isWalletIdFlagged(user[0].wallet_id);
      console.log(isFlagged[0].flag)
      if (isFlagged[0].flag !== 'null' && isFlagged[0].flag === 1){
        return res.status(403).json({ errors: [{ msg: 'user flagged contact admin for asistance' }] });
      }
      let role_response = await users.getUserPermission(user[0].wallet_id);
      console.log(role_response);
      if (!role_response || !role_response.length){
        await users.createPermission({wallet_id: user[0].wallet_id, role_id: 3});
        role_response = await users.getUserPermission(user[0].wallet_id);
      }
      const token = await users.updateToken({wallet_id : user[0].wallet_id, role : role_response[0].role});
      console.log("token :" + token.token);
      let pinSet = true;
      let pin = user[0].pin;
      if (typeof pin === 'undefined' || pin === null || pin == 'null'){
         pinSet = false;
        }
      const user_roles = role_response.map(el => el.role);
      console.log(user_roles[0]);
      return res.json({token , pin : pinSet, user_roles : user_roles[0]});

      
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ msg: 'Internal server error create user' });
    }
  };


  exports.getUserPermission = async (req, res) => {
    try {
      const wallet_id  = req.user.wallet_id;
      console.log(wallet_id);
      const user = await users.getUserPermission(wallet_id);
      return res.status(200).json(user);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Internal server error get user permission');
    }
  };

  exports.authenticateUser = async(req, res) => {
    if (req.body.wallet_id !== req.user.wallet_id) {
      return res.status(403).json({ msg : 'user wallet id mismatch' });
    }
    const comb = req.body.passphrase + req.user.user;
    const _passphrase = await walletModel.getWallet(req.body.wallet_id);
    const _evm = await walletModel.getEVM(req.body.wallet_id);
    const _btc = await walletModel.getBTC(req.body.wallet_id);
    const matchPwd = bcrypt.compareSync(String(comb), _passphrase[0].passphrase);
    //validTx.passphrase == cryptPwd ? true : false;
    if (!matchPwd) {
      return res.status(401).json({ msg : 'invalid_password' });
    }
    const auth_data = {
      comb : comb,
      evm  : _evm[0] || null,
      btc : _btc[0] || null,
      wallet :  _passphrase[0]
    }
    return auth_data;
  }
  
  exports.decryptPrivKey = function(data) {
  const keystrl = CryptoJS.AES.decrypt(data.wallet.mnemonic , pinHash(data.comb));
  const keystore = keystrl.toString(CryptoJS.enc.Utf8);
  const wallet_eth = hdkey.EthereumHDKey.fromMnemonic(keystore, pinHash(data.comb));
  const priv_key = wallet_eth.getWallet().getPrivateKeyString();
  const eth_address = wallet_eth.getWallet().getAddressString();
  const eth_addr = {
    addr : eth_address,
    key :  priv_key
  }
  return eth_addr;
  }

  exports.createUserPin = async(req , res) => {
    try {
      let str = req.body.pin + req.user.wallet_id + req.user.user;
      let pinStr = req.body.pin + req.user.user;
      const pn = pinHash(str);
      const pword = pinHash(pinStr);
      const encrPin = CryptoJS.AES.encrypt(pn, pword).toString();
      //req.body.pin = encrPin;
      const response = await users.setUserPin({wallet_id : req.user.wallet_id, pin : encrPin }); 
      return res.json({response , msg : 'user pin created'});
  } catch (error) {
      console.error(error.message);
      return res.status(500).json({ msg: 'Internal server error create user pin' });
    }
  };
  
  exports.getUserPin = async(req, res) => {
    try {
      const response = await users.fetchUserPin(req.user.wallet_id);
      let pin = response[0].pin;
      if (typeof pin === 'undefined' || pin === null || pin == 'null'){
        return res.status(401).json({ msg: 'pinNotSet' });
      }
      return res.json({pin : pin , msg : 'pinSet'});
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ msg: 'Internal server error get user pin' });
    }
  };
 
  exports.authenticatePin = async(req, res) => {
       const resPin = await users.fetchUserPin(req.user.wallet_id);
       const strPin = req.body.passphrase + req.user.wallet_id + req.user.user;
       const hPin = pinHash(strPin);
       let verPin = req.user.wallet_id + req.user.user;
       let vPin = pinHash(verPin);
       const match =  CryptoJS.AES.decrypt(resPin[0].pin, vPin);
       const matchPin = match.toString(CryptoJS.enc.Utf8);
       const correct = hPin == matchPin ? true : false;
       if (!correct) {
        return res.status(403).json({ msg : 'incorrect_pin' });
      }
  }