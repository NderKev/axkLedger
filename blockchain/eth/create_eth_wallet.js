const bip32 = require('bip32')
const bip39 = require('bip39')
//const bitcoin = require('bitcoinjs-lib')
const moment = require('moment');
const express = require('express');
const cors = require('cors');
//const jwt = require('jsonwebtoken');
const CryptoJS = require("crypto-js");
const pinHash = require('sha256');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const {Web3, HttpProvider}  = require('web3');
const hdPath =  require('./libs/path');
const { hdkey, Wallet } = require('@ethereumjs/wallet');
const provider = require('./libs/provider');
const userModel = require('../../server/psql/models/users');
const farmerModel = require('../../server/psql/models/farmers');
const walletModel = require('../../server/psql/models/wallet');
const { check, validationResult } = require('express-validator');
const {validateToken, validateAdmin} = require('../../server/psql/middleware/auth');
const {authenticateUser, decryptPrivKey, authenticatePin, authenticatePinAdmin, authenticateAdmin} = require('../../server/psql/controllers/auth');

const router  = express.Router();
const {successResponse, errorResponse} = require('./libs/response');

const logStruct = (func, error) => {
    return {'func': func, 'file': 'create_eth_wallet', error}
  }

 

  const  createETHTestCr = async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
    }
    try {
    //const network = bitcoin.networks.testnet; // if we are using (testnet) then  we use networks.testnet 
    const userExists = await userModel.checkUserExists(req.body.wallet_id);
    if (!userExists && !userExists.length) {
      return res.status(403).json({ msg : 'user doesnt exist' });
    }
    const walletExists = await walletModel.checkWallet(req.body.wallet_id);
    if (!walletExists && !walletExists.length) {
        return res.status(403).json({ msg : 'walletNotExists' });
      }
    let auth_evm = {}, data = {}, pin_set = true;
    const adm = req.admin;
    const usr = req.user;
    const wallet = {};
    const check_pin = await userModel.fetchUserPin(req.body.wallet_id);
    const auth = check_pin[0].pin;
    if (typeof auth === 'undefined' || auth === null || auth == 'null'){
    pin_set = false;
    }
    if (pin_set == true && auth !== 'null' && usr){
      await authenticatePin(req, res);
      auth_evm = await authenticateUser(req, res);
      data.user = req.user;
    }
    if (pin_set == true  && auth !== 'null' && adm) {
          await authenticatePinAdmin(req, res)
          auth_evm = await authenticateAdmin(req, res);
          data.user = req.admin;
    }
    
    const eth_address = decryptPrivKey(auth_evm);
  
    wallet.wallet_id = req.body.wallet_id;
    wallet.username = data.user;
    wallet.index = 0;
    wallet.address = eth_address.addr;
    console.log(`
    Wallet generated:
     - Address  : ${eth_address.addr}, 
     - wallet : ${wallet}
         
    `)

    
    const evmExists = await walletModel.checkEVM({wallet_id : req.body.wallet_id, address : wallet.address});
    if (evmExists && evmExists.length) {
        return res.status(403).json({ msg : 'evmExists' });
      }
    
    await walletModel.createEVM({wallet_id : wallet.wallet_id, address : wallet.address, index : wallet.index});
    await walletModel.cryptoBalance({wallet_id : wallet.wallet_id, crypto : "eth", address : wallet.address});
    await walletModel.cryptoBalance({wallet_id : wallet.wallet_id, crypto : "lisk", address : wallet.address});
    await walletModel.cryptoBalance({wallet_id : wallet.wallet_id, crypto : "usdc", address : wallet.address});
    await walletModel.cryptoBalance({wallet_id : wallet.wallet_id, crypto : "usdt", address : wallet.address});
    await walletModel.cryptoBalance({wallet_id : wallet.wallet_id, crypto : "axk", address : wallet.address});
    //await walletModel.cryptoBalance({wallet_id : wallet.wallet_id, crypto : "chnt", address : wallet.address});
    //await walletModel.cryptoBalance({wallet_id : wallet.wallet_id, crypto : "eurc", address : wallet.address});

    return successResponse(201,wallet, 'evmWalletCreated');
    } catch(error){
      console.error('error -> ', logStruct('createETHTestCr', error))
      return errorResponse(error.status, error.message);
    }
    }


    router.post('/create/wallet', validateToken, [
      check('wallet_id', 'Wallet id is required').not().isEmpty(),
      check('passphrase', 'Please include a passphrase').isNumeric().not().isEmpty()
    ],  async(req, res, next) => {
        console.log(req.body);
        //const { username, wallet_id, mnemonic, passphrase, encrypted} = req.body
        const wallet = await createETHTestCr(req, res);
      
        return res.status(wallet.status).send(wallet.data);
    });

    router.post('/create/admin', validateToken, validateAdmin, [
      check('wallet_id', 'Wallet id is required').not().isEmpty(),
      check('pin', 'Please include a pin').isNumeric().not().isEmpty()
    ],  async(req, res, next) => {
        console.log(req.body);
        //const { username, wallet_id, mnemonic, passphrase, encrypted} = req.body
        const wallet = await createETHTestCr(req, res);
      
        return res.status(wallet.status).send(wallet.data);
    });

    const generateUniqueFarmerId = (length)=> {
      const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let id = '';
      for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          id += characters[randomIndex];
      }
      return id;
    }

    const  createFarmerAddress = async(req, res) => {
      const errors = validationResult(req);
    
      if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
      }
      try {
      const wallet_id = generateUniqueFarmerId(32);
      const { name, location} = req.body;
      const wallet = {};
      
      //let mnemonic = bip39.generateMnemonic();
      let comb = name + wallet_id + location; 
      const wallet_eth =  Wallet.generate();//hdkey.EthereumHDKey.fromMnemonic(mnemonic, pinHash(comb));
      //console.log(wallet_eth.getWallet().getAddressString()) 
      console.log(wallet_eth);
      console.log(wallet_eth.getAddressString());
      const farmer_address = wallet_eth.getAddressString();//wallet_eth.getWallet().getAddressString();
      console.log(wallet_eth.getPrivateKeyString() + "; " + wallet_eth.getPublicKeyString());
      const private_key = wallet_eth.getPrivateKeyString();
      const public_key = wallet_eth.getPublicKeyString();
      wallet.wallet_id = wallet_id;
      wallet.private_key = CryptoJS.AES.encrypt(private_key, pinHash(comb)).toString();
      wallet.address = farmer_address;
      wallet.public_key = CryptoJS.AES.encrypt(public_key, pinHash(comb)).toString();
      let key = pinHash(comb);
      wallet.name = name;
      wallet.location = location;
      console.log(`
      Wallet generated:
       - Address  : ${farmer_address}, 
       - Mnemonic : ${public_key}
           
      `)
  
      
      const addressExists = await farmerModel.checkFarmerExists(farmer_address);
      if (addressExists && addressExists.length) {
          return res.status(403).json({ msg : 'farmerAddressExists' });
        }
      const profileExists = await farmerModel.checkFarmerNameLocationExists({name : wallet.name, location : wallet.location});
      if (profileExists && profileExists.length) {
        return res.status(403).json({ msg : 'farmerProfileExists' });
      } 
      
      await farmerModel.createFarmer({wallet_id : wallet.wallet_id, address : wallet.address, name : wallet.name, location : req.body.location, private_key : wallet.private_key, public_key : wallet.public_key, key : key });
      const payload = {
        farmer: {
          wallet_id: wallet_id,
          address : farmer_address,
          name : name,
          location : location
        },
      };
      
      await farmerModel.sleep(1000);
      var token = {};
      var tokn = farmerModel.createToken(payload);
      await farmerModel.sleep(1000);
      if (!tokn) return res.status(401).json({ msg: 'error generating  farmer token!' });  
      if (tokn){
        token.token = tokn.token; 
        console.log("token :" + token.token);
        var tokenExpiry = farmerModel.getExpiryDate(token.token);
        await farmerModel.sleep(1000);
        token.expiry = tokenExpiry.data.exp;
        console.log("token expiry:" + token.expiry);
        wallet.token = token;
        console.log(wallet);
        await farmerModel.sleep(1000);
        await farmerModel.createFarmerToken({address : wallet.address, wallet_id : wallet.wallet_id, token : token.token, expiry : token.expiry});
      }
      
      const resp_farmer = {
        wallet : wallet,
        token : token
      }

      return successResponse(201, resp_farmer, 'farmerWalletCreated');
      } catch(error){
        console.error('error -> ', logStruct('createFarmerAddress', error))
        return errorResponse(error.status, error.message);
      }
      }

    router.post('/create/farmer', validateToken, validateAdmin, [
        check('name', 'farmer name is required').not().isEmpty(),
        check('location', 'Please include farmer location').not().isEmpty()
      ],  async(req, res, next) => {
          console.log(req.body);
          //const { username, wallet_id, mnemonic, passphrase, encrypted} = req.body
          const farmer = await createFarmerAddress(req, res);
        
          return res.status(farmer.status).send(farmer.data);
      });

    const balanceWalletEth = async(data) => {
      try{
        const web3 = new Web3(provider.sepolia);
        const bal_eth = await web3.eth.getBalance(data);
        return successResponse(200, bal_eth, 'balance'); 
      } catch (error) {
      console.error('error -> ', logStruct('balanceWalletEth', error))
      return errorResponse(error.status, error.message);
    }
    }
    const checkEthPriceUSD = async () => {
      const ethPrice = require('eth-price');
 
      try {
        const response = await ethPrice('usd');
        console.log(response);
        return successResponse(200,response)
      } catch (error) {
        console.error('error -> ', logStruct('checkEthPriceUSD', error))
        return errorResponse(error.status, error.message);
      }
      
      }
    const calculateEthPrices = async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
      }
      try {
        if (req.body.wallet_id !== req.user.wallet_id) {
          return res.status(403).json({ msg : 'user wallet id mismatch' });
        }
         const httpProvider = new Web3.providers.HttpProvider(provider.sepolia);
         const web3 = new Web3(httpProvider);
         const bal_eth = await web3.eth.getBalance(req.body.address);
         console.log(bal_eth);
         let bal_eth_wei = Number(bal_eth);
         console.log(bal_eth_wei);
         //let bal_wei =  web3.utils.toWei(bal_eth_wei, "ether");
         let bal_wei = bal_eth_wei * Math.pow(10, -18);
         console.log(bal_wei);
         let bal = {}
         bal.wallet_id = req.body.wallet_id;
         bal.crypto = "eth";
         bal.address = req.body.address;
         bal.balance = bal_wei;
         let getPrice = await checkEthPriceUSD();
         let eth_prc = getPrice.data;
         console.log(eth_prc);
         eth_prc = eth_prc[0];
         console.log(eth_prc);
         eth_prc = eth_prc.replace("USD: ",'');
         console.log(eth_prc);
         let usd = bal_wei * eth_prc;
         let sum = usd.toFixed(2);
         console.log(sum);
         bal.usd = sum;
         await walletModel.updateBalance(bal);
       
        return successResponse(200, bal, {wallet_id: bal.wallet_id, eth_balance : bal.balance, usd_balance : bal.usd})
      } catch (error) {
        console.error('error -> ', logStruct('calculateEthPrices', error))
        return errorResponse(error.status, error.message);
      }
     }


     router.post('/get/balance', [
      check('wallet_id', 'Wallet id is required').isAlphanumeric().not().isEmpty(),
      check('address', 'Please include an address').isEthereumAddress().not().isEmpty(),
      check('x-auth-token', 'User token is required').isJWT().not().isEmpty()
    ], validateToken, async(req, res, next) => {

      const respBal = await calculateEthPrices(req, res); 

      return res.status(respBal.status).send(respBal.data)
    });

    router.get('/get/addr/balance', validateToken, [
      check('wallet_id', 'Wallet id is required').not().isEmpty(),
      check('address', 'Please include an address').not().isEmpty()
    ], async (req, res, next) => {
      const response = await calculateEthPrices(req, res);
      return res.status(response.status).send(response)
    });




    module.exports = router;