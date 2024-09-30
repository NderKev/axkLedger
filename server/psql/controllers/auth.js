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
    if (req.admin) {
      return res.status(403).json({ msg : 'Unauthorized User request' });
    }
    const comb = req.body.passphrase + req.user.user;
    const _passphrase = await walletModel.getWallet(req.body.wallet_id);
    let auth_data = {};
    const _pass = _passphrase.length;
    if (!_pass || _pass <= 0 ){
      auth_data = {
        comb : comb,
        evm  :  null,
        btc :  null,
        wallet :  null
      }
      return auth_data;
    }
    else {
      const _evm = await walletModel.getEVM(req.body.wallet_id);
      const _btc = await walletModel.getBTC(req.body.wallet_id);
      const matchPwd = bcrypt.compareSync(String(comb), _passphrase[0].passphrase);
      if (!matchPwd) {
      return res.status(401).json({ msg : 'invalid_password' });
      }
      if (_btc.length > 0 && _evm.length > 0){
        auth_data = {
        comb : comb,
        evm  : _evm[0],
        btc : _btc[0],
        wallet :  _passphrase[0] 
      }
      }
      else if (_btc.length > 0 && _evm.length <= 0){
        auth_data = {
          comb : comb,
          evm  : null,
          btc : _btc[0],
          wallet :  _passphrase[0] 
        }
      }
      else {
        auth_data = {
          comb : comb,
          evm  : null,
          btc : null,
          wallet :  _passphrase[0] 
        }
      }

      return auth_data;

    }
    
  }

  exports.authenticateAdmin = async(req, res) => {
    if (req.user) {
      return res.status(403).json({ msg : 'Unauthorized Admin request' });
    }

    if (req.body.wallet_id !== req.admin.wallet_id) {
      return res.status(403).json({ msg : 'admin wallet id mismatch' });
    }
    
    const comb = req.body.pin + req.admin.user;
    const _wallet = await walletModel.getWallet(req.body.wallet_id);
    let  admin_data = {};
    const _len = _wallet.length;
    if (!_len || _len <= 0){
      admin_data = {
        comb : comb,
        evm  :  null,
        btc :  null,
        wallet :  null
      }
      return admin_data;
    }
    else {
    const eth = await walletModel.getEVM(req.body.wallet_id);
    const btc = await walletModel.getBTC(req.body.wallet_id);
    const matchPwd = bcrypt.compareSync(String(comb), _wallet[0].passphrase);
    if (!matchPwd) {
      return res.status(401).json({ msg : 'invalid_password' });
    }
    if (btc.length > 0 && eth.length > 0){
      admin_data = {
      comb : comb,
      evm  : eth[0],
      btc : btc[0],
      wallet :  _wallet[0] 
    }
    }
    else if (btc.length > 0 && eth.length <= 0){
      admin_data = {
        comb : comb,
        evm  : null,
        btc : btc[0],
        wallet :  _wallet[0]
      }
    }
    else {
      admin_data = {
        comb : comb,
        evm  : null,
        btc : null,
        wallet :  _wallet[0] 
      }
    }
    return admin_data;
  }
  }
  
  exports.decryptPrivKey = function(data) {
  const keystrl = CryptoJS.AES.decrypt(data.wallet.mnemonic , pinHash(data.comb));
  const keystore = keystrl.toString(CryptoJS.enc.Utf8);
  console.log(keystore);
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

  exports.updateUserPin = async(req, res) => {
    try {
      const usr = req.user, adm = req.admin;
      let currPin, prevPin, newPin, strPrev, strPin, strNew, wid;
      if (usr){
          await this.authenticatePin(req, res);
          currPin = req.body.new_passphrase;
          prevPin = req.body.passphrase + usr.wallet_id + usr.user;
          newPin = currPin + usr.wallet_id + usr.user;
          strPin = currPin + usr.user;
          strPrev = req.body.passphrase + usr.user;
          if (prevPin == newPin){
            return res.status(403).json({ msg : 'new pin cannot match the old pin user' });
          }
          newPin = pinHash(newPin);
          strPin = pinHash(strPin);
          strNew = CryptoJS.AES.encrypt(newPin, strPin).toString();
          wid = usr.wallet_id;
      }
      else {
          await this.authenticatePinAdmin(req, res);
          currPin = req.body.new_pin;
          prevPin = req.body.pin + adm.wallet_id + adm.user;;
          newPin = currPin + adm.wallet_id + adm.user;
          strPin = currPin + adm.user;
          strPrev = req.body.passphrase + adm.user;
          if (prevPin == newPin){
            return res.status(403).json({ msg : 'new pin cannot match the old pin amin' });
          }
          newPin = pinHash(newPin);
          strPin = pinHash(strPin);
          strNew = CryptoJS.AES.encrypt(newPin, strPin).toString();
          wid = adm.wallet_id;
      }
      //const is_wallet = await walletModel.getBTC(wid);
      const init_wallet = await walletModel.getWallet(wid);
      if (init_wallet.length > 0){
      const init_key = CryptoJS.AES.decrypt(init_wallet[0].mnemonic, pinHash(strPrev));
      const decr_key = init_key.toString(CryptoJS.enc.Utf8);
      const new_key = CryptoJS.AES.encrypt(decr_key, pinHash(strPin)).toString();
      const new_passphrase = bcrypt.hashSync(String(strPin), 10);
      await walletModel.updateWallet({wallet_id : wid, key : new_key, passcode : new_passphrase});
      }
      const is_btc = await walletModel.getBTC(wid);
      if (is_btc.length > 0){
        const prev_wif = CryptoJS.AES.decrypt(is_btc[0].wif, pinHash(strPrev));
        const prev_wif_key = prev_wif.toString(CryptoJS.enc.Utf8);
        const new_wif = CryptoJS.AES.encrypt(prev_wif_key, pinHash(strPin)).toString();
        const prev_xpriv = CryptoJS.AES.decrypt(is_btc[0].xpriv, pinHash(strPrev));
        const prev_xpriv_key = prev_xpriv.toString(CryptoJS.enc.Utf8);
        const new_xpriv = CryptoJS.AES.encrypt(prev_xpriv_key, pinHash(strPin)).toString();
        const prev_xpub = CryptoJS.AES.decrypt(is_btc[0].xpub, pinHash(strPrev));
        const prev_xpub_key = prev_xpub.toString(CryptoJS.enc.Utf8);
        const new_xpub = CryptoJS.AES.encrypt(prev_xpub_key, pinHash(strPin)).toString();
        await walletModel.updateBTCKeys({wallet_id : wid, wif_key : new_wif, pub_key : new_xpub, priv_key : new_xpriv});
      }
      const is_xrp = await walletModel.getXRPWallet(wid);
      if (is_xrp.length > 0){
        const prev_pub = CryptoJS.AES.decrypt(is_xrp[0].pubKey, pinHash(strPrev));
        const prev_pub_key = prev_pub.toString(CryptoJS.enc.Utf8);
        const new_pub = CryptoJS.AES.encrypt(prev_pub_key, pinHash(strPin)).toString();
        const prev_priv = CryptoJS.AES.decrypt(is_xrp[0].privKey, pinHash(strPrev));
        const prev_priv_key = prev_priv.toString(CryptoJS.enc.Utf8);
        const new_priv = CryptoJS.AES.encrypt(prev_priv_key, pinHash(strPin)).toString();
        await walletModel.updateXRPKeys({wallet_id : wid, new_pub : new_pub, new_priv : new_priv});
      }
      await users.setUserPin({wallet_id : wid, pin : strNew});
      return res.json({pin : strNew , msg : 'pinUpdated'});
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ msg: 'Internal server error update user pin' });
    }
  };
 
  exports.authenticatePin = async(req, res) => {
       const resPin = await users.fetchUserPin(req.user.wallet_id);
       const strPin = req.body.passphrase + req.user.wallet_id + req.user.user;
       const hPin = pinHash(strPin);
       let verPin = req.body.passphrase + req.user.user;
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
    const token = req.header('x-auth-token');
    const farmer_token = req.header('x-farmer-token');
    const {wallet_id} = req.body;
    var timeNow = Math.floor(Date.now() / 1000);
    let updateToken;
    if (!token && !farmer_token && !wallet_id) return res.status(403).json({ msg: 'Unauthorized request!' });
    if (token && wallet_id){
      const curr_token = await users.getCurrentTokenUser({wallet_id : wallet_id, token : token});
      if (!curr_token && !curr_token.length) return res.status(401).json({ msg: 'Unexisting user jwt db!' });
      const expiry = curr_token[0].expiration;
      const wid = curr_token[0].wallet_id;
      if (expiry <= timeNow && wid == wallet_id) {
        const user_token = await users.genToken(wallet_id);
        await users.updateCurrentUserToken({token: token, new_token : user_token.token, expiration : user_token.expiration});
        updateToken = await users.verifyToken(user_token.token);
        return res.send(updateToken);
       }
      if (expiry > timeNow && wid == wallet_id){
          updateToken = await users.verifyToken(token);
          return res.send(updateToken);
      }
     if (wid !== wallet_id) {
        return res.status(403).json({ msg : 'invalid user token details' });
      }
    }
    /** else if (admin && pin !== 'null' ){
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
    } **/
    else if (farmer_token && wallet_id){
      const frm_token = await farmers.getJWTFarmerToken({token : farmer_token, wallet_id : wallet_id});
      if (!frm_token && !frm_token.length) return res.status(401).json({ msg: 'Unexisting farmer jwt db!' });
      const expiry = frm_token[0].expiry;
      const address = frm_token[0].address;
      const fid = frm_token[0].wallet_id;
      
      //const _address = farmer.address;
      if (expiry > timeNow && fid == wallet_id ){ 
        updateToken = await farmers.verifyToken(farmer_token);
        return updateToken;
      }
      
      if (expiry < timeNow && fid == wallet_id){
        let payload = {
          farmer : {
            wallet_id: fid,
            address : address
          }
        }
        const token =  farmers.createToken(payload);
        const expiry_date =  farmers.getExpiryDate(token.token);
        await farmers.updateFarmerToken({address : address, token : token.token, expiry: expiry_date.data.exp});
        updateToken = await farmers.verifyToken(token.token);
        return res.send(updateToken);
      }

      if (fid !== wallet_id) {
        return res.status(403).json({ msg : 'invalid farmer token details' });
      }
    }
    else {
      return res.status(404).json({ msg : 'no required parameters for refreshing user token' });
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