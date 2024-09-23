const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const users = require('../models/users');
const CryptoJS = require("crypto-js");
const walletModel = require('../models/wallet');
const { hdkey, Wallet } = require('@ethereumjs/wallet');
const farmers = require('../models/farmers');
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
      //console.log(user);
      if (!user && !user.length) {
        return res.status(400).json({ errors: [{ msg: 'User not registered yet' }] });
      }
      let role_response = await users.getUserPermission(user[0].wallet_id);
      //console.log(role_response[0].role);
      if (!role_response || !role_response.length){
        return res.status(403).json({ msg : 'forbidden Request' });
      } 
      if (role_response[0].role === 'admin' || role_response[0].role == 'admin'){
        return res.status(403).json({ msg : 'forbidden Request' });
      }
      const isMatch = await bcrypt.compare(String(password), user[0].password);
  
      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials login user' }] });
      }

      const isFlagged = await users.isWalletIdFlagged(user[0].wallet_id);
      //console.log(isFlagged[0].flag)
      if (isFlagged[0].flag !== 'null' && isFlagged[0].flag === 1){
        return res.status(403).json({ errors: [{ msg: 'user flagged contact admin for asistance' }] });
      }
      
      const token = await users.updateToken(user[0].wallet_id);
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
    if (req.admin || req.admin.wallet_id) {
      return res.status(403).json({ msg : 'Unauthorized User request' });
    }
    const comb = req.body.passphrase + req.user.user;
    const _passphrase = await walletModel.getWallet(req.body.wallet_id);
    const _evm = await walletModel.getEVM(req.body.wallet_id);
    const _btc = await walletModel.getBTC(req.body.wallet_id);
    const matchPwd = bcrypt.compareSync(String(comb), _passphrase[0].passphrase);
    if (!matchPwd) {
      return res.status(401).json({ msg : 'invalid_password' });
    }
    const auth_data = {
      comb : comb,
      evm  : _evm[0] || null,
      btc : _btc[0] || null,
      wallet :  _passphrase[0] || null
    }
    return auth_data;
  }

  exports.authenticateAdmin = async(req, res) => {
    if (req.user || req.user.wallet_id) {
      return res.status(403).json({ msg : 'Unauthorized Admin request' });
    }

    if (req.body.wallet_id !== req.admin.wallet_id) {
      return res.status(403).json({ msg : 'admin wallet id mismatch' });
    }
    
    const comb = req.body.pin + req.admin.user;
    const _passphrase = await walletModel.getWallet(req.body.wallet_id);
    const _evm = await walletModel.getEVM(req.body.wallet_id);
    const _btc = await walletModel.getBTC(req.body.wallet_id);
    const matchPwd = bcrypt.compareSync(String(comb), _passphrase[0].passphrase);
    if (!matchPwd) {
      return res.status(401).json({ msg : 'invalid_password' });
    }
    const auth_data = {
      comb : comb,
      evm  : _evm[0] || null,
      btc : _btc[0] || null,
      wallet :  _passphrase[0] || null
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
      const pin_set = await users.fetchUserPin(req.user.wallet_id);
      const res_pin = pin_set[0].pin;
      console.log(res_pin);
      if (res_pin !== 'null' && res_pin !== null ){
        return res.status(403).json({ msg : 'pinExists' });
      }
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

  exports.authenticatePinAdmin = async(req, res) => {
    const resPin = await users.fetchUserPin(req.admin.wallet_id);
    console.log(resPin[0].pin);
    const strPin = req.body.pin + req.admin.wallet_id + req.admin.user;
    const hPin = pinHash(strPin);
    const verPin = req.body.pin + req.admin.user;
    const vPin = pinHash(verPin);
    const match =  CryptoJS.AES.decrypt(resPin[0].pin, vPin);
    const matchPin = match.toString(CryptoJS.enc.Utf8);
    const correct = hPin == matchPin ? true : false;
    if (!correct) {
     return res.status(403).json({ msg : 'incorrect_pin' });
   }
}

  exports.refreshToken = async(req, res) => {
    try {
    const token = req.token;
    const user = req.user;
    const admin = req.admin;
    const farmer = req.farmer;
    const {pin, passphrase} = req.body;
    var timeNow = Math.floor(Date.now() / 1000);
    let updateToken;
    if (!token && !pin && !passphrase) return res.status(403).json({ msg: 'Unauthorized request!' });
    if (user && passphrase !== 'null'){
      const curr_token = await users.getCurrentTokenUser({wallet_id : user.wallet_id, token : token});
      if (!curr_token && !curr_token.length) return res.status(401).json({ msg: 'Unexisting user jwt db!' });
      await this.authenticatePin(req, res);
      const _wid = user.wallet_id;
      const expiry = curr_token[0].expiration;
      const wid = curr_token[0].wallet_id;
      if (expiry > timeNow && wid == _wid){
          updateToken = await users.verifyToken(token);
         return res.send(updateToken);
      }
     else if (expiry < timeNow && wid == _wid) {
       const user_token = await users.genToken(user.wallet_id);
       await users.updateCurrentUserToken({token: token, new_token : user_token.token, expiration : user_token.expiration});
       updateToken = await users.verifyToken(user_token.token);
       return res.send(updateToken);
      }
      else if (wid !== _wid) {
        return res.status(403).json({ msg : 'invalid buyer token details' });
      }
      else {
        return res.status(404).json({ msg : 'error refreshing buyer token' });
      }
    }
    else if (admin && pin !== 'null' ){
      const curr_token = await users.getCurrentTokenUser({wallet_id : admin.wallet_id, token : token});
      if (!curr_token && !curr_token.length) return res.status(401).json({ msg: 'Unexisting admin jwt db!' });
      await this.authenticatePinAdmin(req, res);
      const expiry = curr_token[0].expiration;
      const _wid = admin.wallet_id;
      const wid = curr_token[0].wallet_id;
      if (expiry > timeNow && wid == _wid){
        updateToken = await users.verifyToken(token);
        return res.send(updateToken);
      }
      else if (expiry < timeNow && wid == _wid) {
        const adm_token = await users.genToken(admin.wallet_id);
        await users.updateCurrentUserToken({token: token, new_token : adm_token.token, expiration : adm_token.expiration});
        updateToken = await users.verifyToken(adm_token.token);
        return res.send(updateToken);
      }
      else if (wid !== _wid) {
        return res.status(403).json({ msg : 'invalid admin token details' });
      }
      else {
        return res.status(404).json({ msg : 'error refreshing token admin' });
      }
    }
    else if (farmer){
      const frm_token = await farmers.getJWTFarmerToken(token);
      if (!frm_token && !frm_token.length) return res.status(401).json({ msg: 'Unexisting farmer jwt db!' });
      const expiry = frm_token[0].expiry;
      const _wid = farmer.wallet_id;
      const wid = frm_token[0].wallet_id;
      if (expiry > timeNow && wid == _wid && farmer.address == frm_token[0].address){
        updateToken = await farmers.verifyToken(token);
        return updateToken;
      }
      else if (expiry < timeNow && wid == _wid && farmer.address == frm_token[0].address){
        let payload = {
          farmer : {
            wallet_id: farmer.wallet_id,
            address : farmer.address
          }
        }
        const token =  farmers.createToken(payload);
        const expiry_date =  farmers.getExpiryDate(token.token);
        await farmers.updateFarmerToken({address : farmer.address, token : token.token, expiry: expiry_date.data.exp});
        updateToken = await farmers.verifyToken(token.token);
        return res.send(updateToken);
      }
      else if (wid !== _wid || farmer.address !== frm_token[0].address) {
        return res.status(403).json({ msg : 'invalid farmer token details' });
      }
      else {
        return res.status(404).json({ msg : 'error refreshing farmer token' });
      }
    }
    else {
      return res.status(404).json({ msg : 'no req refreshing users token' });
    } 
  } catch (err) {
    console.error(err.message + ': Internal auth error in token refresh controller');
    res.status(500).json({ msg: 'Internal refresh user token error' });
  }
}

exports.updateUserRole = async (req, res) => {
  try {
    const user = await users.updateRoleTime(req.body);
    return res.status(200).json(user);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Internal server error update user role time');
  }
};

exports.updateUserPermission = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { wallet_id, user_role, role_id } = req.body;
  try {
    const userExists = await users.checkUserExists(wallet_id);
    if (!userExists && !userExists.length) {
      return res.status(403).json({ msg : 'userNotExists' });
    }
    if (role_id == 1 || user_role === 'admin'){
      return res.status(404).json({ msg : 'forbidden Request' });
    }
    

    let input = {
      role_id : role_id,
      wallet_id : wallet_id
    }
    await users.updatePermission(input);

    return res.json({input , msg : ' user permission updated'});
    
  } catch (error) {
      console.error(error.message);
      return res.status(500).json({ msg: 'Internal server error update user permission' });
  }
};