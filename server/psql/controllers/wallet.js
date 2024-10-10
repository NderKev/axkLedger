const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { validationResult } = require('express-validator');
const {isAddress} = require("web3-validator");
const wallet = require('../models/wallet');
const users = require('../models/users');

exports.createWallet = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {mnemonic, passphrase, wif, address, xpub, xpriv} = req.body;
    try { 
        const usr = req.user, adm = req.admin;
        let walletid;
        if (usr){
          walletid = usr.wallet_id;
        }
        else {
          walletid = adm.wallet_id
        }
        const userExists = await users.checkUserExists(walletid);
        if (!userExists && !userExists.length) {
          return res.status(403).json({ msg : 'user doesnt exist' });
        }
        const walletExists = await wallet.checkWallet(walletid);
        if (walletExists && walletExists.length) {
            return res.status(403).json({ msg : 'walletExists' });
          }
        //const salt = await bcrypt.genSalt(10);
        //let _passphrase = await bcrypt.hash(passphrase, salt);
        await wallet.createWallet({wallet_id : walletid, mnemonic : mnemonic, passphrase : passphrase});
        await wallet.createBTC({wallet_id : walletid, wif : wif, address : address, xpub : xpub, xpriv :xpriv});
        await wallet.createWif({wallet_id : walletid, wif : wif, address : address});
        return res.json({wallet_id : walletid, btc : address, msg : 'crypto and btc wallet created'});
    }catch (error) {
        console.error(error.message);
        return res.status(500).json({ msg: 'Internal server error create wallet' });
    }
}

exports.createEVM = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const validAddress = isAddress(req.body.address);
    if (!validAddress || validAddress === 'null'|| typeof validAddress === 'undefined'){
     return res.status(401).json({ msg: 'Invalid address!' });
    } 
    const { address, index} = req.body;
    
    try {  
        const usr = req.user, adm = req.admin;
        let walletid;
        if (usr){
          walletid = usr.wallet_id;
        }
        else {
          walletid = adm.wallet_id
        }
        const userExists = await users.checkUserExists(walletid);
        if (!userExists && !userExists.length) {
          return res.status(403).json({ msg : 'user doesnt exist' });
        }
        const walletExists = await wallet.checkWallet(walletid);
        if (!walletExists && !walletExists.length) {
            return res.status(403).json({ msg : 'walletNotExists' });
          }
        const evmExists = await wallet.checkEVM({wallet_id : walletid, address : address});
        if (evmExists && evmExists.length) {
            return res.status(403).json({ msg : 'evmExists' });
          }
        
        await wallet.createEVM({wallet_id : walletid, address : address, index : index});
        return res.json({wallet_id : walletid, evm : address, msg : 'evm wallet created'});
    }catch (error) {
        console.error(error.message);
        return res.status(500).json({ msg: 'Internal server error create evm wallet' });
    }
}

exports.createXRP = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {pubKey, privKey, index, address, balance} = req.body;
    try {  
        const usr = req.user, adm = req.admin;
        let walletid;
        if (usr){
          walletid = usr.wallet_id;
        }
        else {
          walletid = adm.wallet_id
        }
        const userExists = await users.checkUserExists(walletid);
        if (!userExists && !userExists.length) {
          return res.status(403).json({ msg : 'user doesnt exist' });
        }
        const walletExists = await wallet.checkWallet(walletid);
        if (!walletExists && !walletExists.length) {
            return res.status(403).json({ msg : 'walletNotExists' });
          }
        const xrpExists = await wallet.checkXRP({wallet_id : walletid, address : address});
        if (xrpExists && xrpExists.length) {
            return res.status(403).json({ msg : 'xrpExists' });
          }
        await wallet.createXRP({wallet_id : walletid, pubKey : pubKey, privKey : privKey, index : index,  address : address, balance : balance });
        return res.json({wallet_id : walletid, xrp : address, msg : 'xrp wallet created'});
    }catch (error) {
        console.error(error.message);
        return res.status(500).json({ msg: 'Internal server error create xrp wallet' });
    }
}

exports.createWif = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { wif, address, index} = req.body;
    try {
       
        const usr = req.user, adm = req.admin;
        let walletid;
        if (usr){
          walletid = usr.wallet_id;
        }
        else {
          walletid = adm.wallet_id
        }
        const userExists = await users.checkUserExists(walletid);
        if (!userExists && !userExists.length) {
          return res.status(403).json({ msg : 'user doesnt exist' });
        }
        const walletExists = await wallet.checkWallet(walletid);
        if (!walletExists && !walletExists.length) {
            return res.status(403).json({ msg : 'walletNotExists' });
          }
        const wifExists = await wallet.checkWif(wif);
        if (wifExists && wifExists.length) {
            return res.status(403).json({ msg : 'wifExists' });
          }
        
        await wallet.createWif({wallet_id : walletid, wif : wif, address : address, index : index });
        return res.json({wallet_id : walletid, address : address, msg : 'wif wallet created'});
    }catch (error) {
        console.error(error.message);
        return res.status(500).json({ msg: 'Internal server error create wif' });
    }
}

exports.cryptoBalance = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {crypto, address, balance} = req.body;
    try { 
        const usr = req.user, adm = req.admin;
        let walletid;
        if (usr){
          walletid = usr.wallet_id;
        }
        else {
          walletid = adm.wallet_id
        }
        const userExists = await users.checkUserExists(walletid);
        if (!userExists && !userExists.length) {
          return res.status(403).json({ msg : 'user doesnt exist' });
        }
        const walletExists = await wallet.checkWallet(walletid);
        if (!walletExists && !walletExists.length) {
            return res.status(403).json({ msg : 'walletNotExists' });
          }
        const balExists = await wallet.checkBalance({wallet_id : walletid, crypto : crypto, address : address});
        if (balExists && balExists.length) {
            return res.status(403).json({ msg : 'balanceExists' });
          }
        
        await wallet.cryptoBalance({wallet_id : walletid, crypto : crypto, address : address, balance : balance });
        return res.json({wallet_id : walletid, crypto : crypto, balance : balance, msg : ' wallet balance created'});
    }catch (error) {
        console.error(error.message);
        return res.status(500).json({ msg: 'Internal server error crypto balance' });
    }
}

exports.evmBalance = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {crypto, address, balance} = req.body;
  try { 
      const usr = req.user, adm = req.admin;
      let walletid;
      if (usr){
        walletid = usr.wallet_id;
      }
      else {
        walletid = adm.wallet_id
      }
      const userExists = await users.checkUserExists(walletid);
      if (!userExists && !userExists.length) {
        return res.status(403).json({ msg : 'user doesnt exist' });
      }
      const walletExists = await wallet.checkWallet(walletid);
      if (!walletExists && !walletExists.length) {
          return res.status(403).json({ msg : 'walletNotExists' });
        }
      const balExists = await wallet.checkEvmBalance({wallet_id : walletid, crypto : crypto, address : address});
      if (balExists && balExists.length) {
          return res.status(403).json({ msg : 'balanceExists' });
        }
      
      await wallet.evmBalance({wallet_id : walletid, crypto : crypto, name : data.name, address : address, balance : balance });
      return res.json({wallet_id : walletid, crypto : crypto, balance : balance, msg : ' evm wallet balance created'});
  }catch (error) {
      console.error(error.message);
      return res.status(500).json({ msg: 'Internal server error crypto balance' });
  }
}

exports.updateWalletPassphrase = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  //const {passphrase} = req.body;
  try {     
      const usr = req.user, adm = req.admin;
      let walletid, user, passphrase;
      if (usr){
        walletid = usr.wallet_id;
        user = usr.user;
        passphrase = req.body.passphrase;
      }
      else {
        walletid = adm.wallet_id;
        user = adm.user;
        passphrase = req.body.pin;
      }
      const userExists = await users.checkUserExists(walletid);
      if (!userExists && !userExists.length) {
        return res.status(403).json({ msg : 'user doesnt exist' });
      }
      const walletExists = await wallet.checkWallet(walletid);
      if (!walletExists && !walletExists.length) {
          return res.status(403).json({ msg : 'walletNotExists' });
        }
      console.log("username" + user);
      let str = passphrase + user;
      let saltRounds = 10;
      let _passphrase = bcrypt.hashSync(String(str), saltRounds);
      
      await wallet.updateWalletPassphrase({wallet_id : walletid, passphrase : _passphrase });
      return res.json({wallet_id : walletid, msg : 'crypto wallet passphrase updated'});
  }catch (error) {
      console.error(error.message);
      return res.status(500).json({ msg: 'Internal server error update wallet passphrase' });
  }
}

exports.updateBalance = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {crypto, address, balance, usd} = req.body;
    try {   
        const usr = req.user, adm = req.admin;
        let walletid;
        if (usr){
          walletid = usr.wallet_id;
        }
        else {
          walletid = adm.wallet_id
        }
        const userExists = await users.checkUserExists(walletid);
        if (!userExists && !userExists.length) {
          return res.status(403).json({ msg : 'user doesnt exist' });
        }
        const walletExists = await wallet.checkWallet(walletid);
        if (!walletExists && !walletExists.length) {
            return res.status(403).json({ msg : 'walletNotExists' });
          }
        const balExists = await wallet.checkBalance({wallet_id : walletid, crypto : crypto, address : address});
        if (!balExists && !balExists.length) {
            return res.status(403).json({ msg : 'balanceNotExists' });
          }
        
        await wallet.updateBalance({wallet_id : walletid, crypto : crypto, address : address, balance : balance, usd :usd });
        return res.json({wallet_id : walletid, crypto : crypto, balance : balance, msg : ' wallet balance updated'});
    }catch (error) {
        console.error(error.message);
        return res.status(500).json({ msg: 'Internal server error update balance' });
    }
}

exports.updateEvmBalance = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {crypto, address, balance, usd} = req.body;
  try {   
      const usr = req.user, adm = req.admin;
      let walletid;
      if (usr){
        walletid = usr.wallet_id;
      }
      else {
        walletid = adm.wallet_id
      }
      const userExists = await users.checkUserExists(walletid);
      if (!userExists && !userExists.length) {
        return res.status(403).json({ msg : 'user doesnt exist' });
      }
      const walletExists = await wallet.checkWallet(walletid);
      if (!walletExists && !walletExists.length) {
          return res.status(403).json({ msg : 'walletNotExists' });
        }
      const balExists = await wallet.checkEvmBalance({wallet_id : walletid, crypto : crypto, address : address});
      if (!balExists && !balExists.length) {
          return res.status(403).json({ msg : 'balanceNotExists' });
        }
      
      await wallet.updateEvmBalance({wallet_id : walletid, crypto : crypto, address : address, balance : balance, usd :usd });
      return res.json({wallet_id : walletid, crypto : crypto, balance : balance, msg : ' evm wallet balance updated'});
  }catch (error) {
      console.error(error.message);
      return res.status(500).json({ msg: 'Internal server error update evm balance' });
  }
}

exports.updateBTC = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {wif, address, index} = req.body;
    try {     
        const usr = req.user, adm = req.admin;
        let walletid;
        if (usr){
          walletid = usr.wallet_id;
        }
        else {
          walletid = adm.wallet_id
        }
        const userExists = await users.checkUserExists(walletid);
        if (!userExists && !userExists.length) {
          return res.status(403).json({ msg : 'user doesnt exist' });
        }
        const walletExists = await wallet.checkWallet(walletid);
        if (!walletExists && !walletExists.length) {
            return res.status(403).json({ msg : 'walletNotExists' });
          }
        const btcExists = await wallet.checkBTC(walletid);
        if (!btcExists && !btcExists.length) {
            return res.status(403).json({ msg : 'btcNotExists' });
          }
        
        await wallet.updateBTC({wallet_id : walletid, wif : wif, address : address, index : index });
        return res.json({wallet_id : walletid, address : address, msg : 'btc wallet updated'});
    }catch (error) {
        console.error(error.message);
        return res.status(500).json({ msg: 'Internal server error update btc' });
    }
}

exports.updateEVMIndex = async (req, res) => {
    try {
      const usr = req.user, adm = req.admin;
      let wallet_id;
      if (usr){
        wallet_id = usr.wallet_id;
      }
      else {
        wallet_id = adm.wallet_id
      }
      let { address, index } = req.body;
      const isExists = await wallet.isEVM(wallet_id);
      if (!isExists && !isExists.length) {
          return res.status(403).json({ msg : 'evmIndexNotExists' });
        }
      const idx = await wallet.updateEVMIndex({wallet_id : wallet_id, address : address, index : index});
      return res.status(200).json(idx);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Internal server error update evm index');
    }
  }; 

exports.getBalance = async (req, res) => {
    try {
      const usr = req.user, adm = req.admin;
      let wallet_id;
      if (usr){
        wallet_id = usr.wallet_id;
      }
      else {
        wallet_id = adm.wallet_id
      }
      const {crypto, address} = req.body;
      const balExists = await wallet.checkBalance({wallet_id : wallet_id, crypto : crypto, address : address});
      if (!balExists && !balExists.length) {
          return res.status(403).json({ msg : 'balanceNotExists' });
        }
      const balance = await wallet.getBalance({wallet_id : wallet_id, crypto : crypto, address : address});
      return res.status(200).json(balance);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Internal server error get balance');
    }
  }; 

  exports.getEvmBalance = async (req, res) => {
    try {
      const usr = req.user, adm = req.admin;
      let wallet_id;
      if (usr){
        wallet_id = usr.wallet_id;
      }
      else {
        wallet_id = adm.wallet_id
      }
      const {crypto, address} = req.body;
      const balExists = await wallet.checkEvmBalance({wallet_id : wallet_id, crypto : crypto, address : address});
      if (!balExists && !balExists.length) {
          return res.status(403).json({ msg : 'balanceNotExists' });
        }
      const balance = await wallet.getEvmBalance({wallet_id : wallet_id, crypto : crypto, address : address});
      return res.status(200).json(balance);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Internal server error get evm balance');
    }
  }; 

exports.getWallet = async (req, res) => {
    try {
      const usr = req.user, adm = req.admin;
      let wallet_id;
      if (usr){
        wallet_id = usr.wallet_id;
      }
      else {
        wallet_id = adm.wallet_id
      }
      const walletExists = await wallet.checkWallet(wallet_id);
        if (!walletExists && !walletExists.length) {
            return res.status(403).json({ msg : 'walletNotExists' });
          }
      const _wallet = await wallet.getWallet(wallet_id);
      return res.status(200).json(_wallet);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Internal server error get wallet');
    }
  };

exports.getBTC = async (req, res) => {
    try {
      const usr = req.user, adm = req.admin;
      let wallet_id;
      if (usr){
        wallet_id = usr.wallet_id;
      }
      else {
        wallet_id = adm.wallet_id
      }
      const btcExists = await wallet.checkBTC(wallet_id);
      if (!btcExists && !btcExists.length) {
          return res.status(403).json({ msg : 'btcNotExists' });
        }
      const btc = await wallet.getBTC(wallet_id);
      return res.status(200).json(btc);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Internal server error get btc');
    }
  };

exports.getEVM = async (req, res) => {
    try {
      const usr = req.user, adm = req.admin;
      let wallet_id;
      if (usr){
        wallet_id = usr.wallet_id;
      }
      else {
        wallet_id = adm.wallet_id
      }
      const evmExists = await wallet.isEVM(wallet_id);
      if (!evmExists && !evmExists.length) {
          return res.status(403).json({ msg : 'evmNotExists' });
        }
      const evm = await wallet.getEVM(wallet_id);
      return res.status(200).json(evm);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Internal server error get evm');
    }
  };

exports.getXRP = async (req, res) => {
    try {
      const usr = req.user, adm = req.admin;
      let wallet_id;
      if (usr){
        wallet_id = usr.wallet_id;
      }
      else {
        wallet_id = adm.wallet_id
      }
      const xrpExists = await wallet.isXRP(wallet_id);
      if (!xrpExists && !xrpExists.length) {
          return res.status(403).json({ msg : 'xrpNotExists' });
        }
      const xrp = await wallet.getXRP(wallet_id);
      return res.status(200).json(xrp);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Internal server error get xrp');
    }
  };  

exports.getWifs = async (req, res) => {
    try {
      const usr = req.user, adm = req.admin;
      let wallet_id;
      if (usr){
        wallet_id = usr.wallet_id;
      }
      else {
        wallet_id = adm.wallet_id
      }
      const wifExists = await wallet.checkWif(wallet_id);
      if (!wifExists && !wifExists.length) {
          return res.status(403).json({ msg : 'wifsNotExists' });
        }
      const wifs = await wallet.getWifs(wallet_id);
      return res.status(200).json(wifs);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Internal server error get wifs');
    }
  }; 

  exports.getWif = async (req, res) => {
    try {
      let {wallet_id, address } = req.body;
      const wifExists = await wallet.checkWif(wallet_id);
      if (!wifExists && !wifExists.length) {
          return res.status(403).json({ msg : 'wifNotExists' });
        }
      const wif = await wallet.getWif({wallet_id : wallet_id, address : address});
      return res.status(200).json(wif);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Internal server error get wifs');
    }
  }; 

