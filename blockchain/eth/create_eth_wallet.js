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
    const userExists = await userModel.checkUserExists(req.user.wallet_id);
    if (!userExists && !userExists.length) {
      return res.status(403).json({ msg : 'user doesnt exist' });
    }
    const walletExists = await walletModel.checkWallet(req.user.wallet_id);
    if (!walletExists && !walletExists.length) {
        return res.status(403).json({ msg : 'walletNotExists' });
      }

    if (req.body.wallet_id !== req.user.wallet_id) {
      return res.status(403).json({ msg : 'user wallet id mismatch' });
    }

    const path =`m/49'/1'/0'/0`; // we use  `m/49'/1'/0'/0` for testnet network
    const hdPath =  require('./libs/path');
    const wallet = {};
    
    //let mnemonic = bip39.generateMnemonic()
    let comb = req.body.passphrase + req.user.user;
    let _passphrase = await walletModel.getWallet(req.body.wallet_id);
    const matchPwd = bcrypt.compareSync(String(comb), _passphrase[0].passphrase);
       //validTx.passphrase == cryptPwd ? true : false;
       if (!matchPwd) {
         return errorResponse(401,"passphrase_wrong", {message : "wrongPassphrase"});
       }

    let kystr = CryptoJS.AES.decrypt(_passphrase[0].mnemonic, pinHash(comb));
    const _mnemonic = kystr.toString(CryptoJS.enc.Utf8); 
    const wallet_eth = hdkey.EthereumHDKey.fromMnemonic(_mnemonic, pinHash(comb));
    console.log(wallet_eth.getWallet().getAddressString()) 
    const eth_address = wallet_eth.getWallet().getAddressString();
  
    wallet.wallet_id = req.body.wallet_id;
    wallet.mnemonic = CryptoJS.AES.encrypt(_mnemonic, pinHash(comb)).toString();
    wallet.username = req.user.user;
    //wallet.passphrase = bcrypt.hashSync(String(comb), saltRounds);
    //wallet.wif = cryptKey;
    wallet.index = 0;
    wallet.address = eth_address;
    //wallet.xPub = cryptXpub;
    //wallet.xPriv = cryptXpriv;
    console.log(`
    Wallet generated:
     - Address  : ${eth_address}, 
     - Mnemonic : ${_mnemonic}
         
    `)

    
    const evmExists = await walletModel.checkEVM({wallet_id : req.user.wallet_id, address : wallet.address});
    if (evmExists && evmExists.length) {
        return res.status(403).json({ msg : 'evmExists' });
      }
    
    await walletModel.createEVM({wallet_id : wallet.wallet_id, address : wallet.address, index : wallet.index});
    await walletModel.cryptoBalance({wallet_id : wallet.wallet_id, crypto : "eth", address : wallet.address});
   
    return successResponse(201,wallet, 'evmWalletCreated');
    } catch(error){
      console.error('error -> ', logStruct('createETHTestCr', error))
      return errorResponse(error.status, error.message);
    }
    }


    router.post('/create/wallet', validateToken, [
      check('wallet_id', 'Wallet id is required').not().isEmpty(),
      check('passphrase', 'Please include a passphrase').not().isEmpty(),
      check('username', 'Username is required').not().isEmpty()
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
      //const network = bitcoin.networks.testnet; // if we are using (testnet) then  we use networks.testnet 
      const wallet_id = generateUniqueFarmerId(32);
      /** const farmerExists = await farmerModel.checkFarmerExists(req.body.wallet_id);
      if (farmerExists && farmerExists.length) {
        return res.status(403).json({ msg : 'farmer exists' });
      } **/
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
      wallet.public_key = CryptoJS.AES.encrypt(public_key, pinHash(comb)).toString();;
      //wallet.wif = cryptKey;
      //wallet.index = 0;
      let key = pinHash(comb);
      wallet.name = name;
      wallet.location = location;
      //wallet.xPub = cryptXpub;
      //wallet.xPriv = cryptXpriv;
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
      //await walletModel.cryptoBalance({wallet_id : wallet.wallet_id, crypto : "eth", address : wallet.address});
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
      return successResponse(201, wallet, 'farmerWalletCreated');
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
        const response = await ethPrice('usd');//transactionsModel.updateTransactionRef(validInput);
        //const response = {};
        //response.data = price;
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
         //bal_eth 
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
         //let pr = eth_prc.toFixed(2);
         //console.log(pr);
         let usd = bal_wei * eth_prc;
         let sum = usd.toFixed(2);
         console.log(sum);
         /** let ksh_usd = await transactionController.rateUsdToKes();

         ksh_usd = ksh_usd.data.toFixed(2);
        if(ksh_usd <= 0){
             ksh_usd = 110
          } **/
        //let ksh_usd = 110;
        // let tF = sum  * ksh_usd;
         //tF = tF.toFixed(2);
        // console.log(tF);
         bal.usd = sum;
         await walletModel.updateBalance(bal);
       
        return successResponse(200, bal, {wallet_id: bal.wallet_id, eth_balance : bal.balance, usd_balance : bal.usd})
      } catch (error) {
        console.error('error -> ', logStruct('calculateEthPrices', error))
        return errorResponse(error.status, error.message);
      }
     }


     router.post('/get/balance', validateToken, [
      check('wallet_id', 'Wallet id is required').not().isEmpty(),
      check('address', 'Please include an address').not().isEmpty()
      //check('user', 'Username is required').not().isEmpty()
    ], async(req, res, next) => {

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