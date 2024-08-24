const bip32 = require('bip32')
const bip39 = require('bip39')
//const bitcoin = require('bitcoinjs-lib')
const moment = require('moment');
const express = require('express');
const cors = require('cors');
const CryptoJS = require("crypto-js");
const pinHash = require('sha256');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
//const lightwallet  = require('eth-lightwallet');
const {Web3, HttpProvider}  = require('web3');
const hdPath =  require('./libs/path');
//const SignerProvider = require('ethjs-provider-signer');
//const setWeb3Provider = require('./libs/setWeb3Provider');
const { hdkey } = require('@ethereumjs/wallet')
//const autogenerate = require("./autogenerate");
const provider = require('./libs/provider');
const walletModel = require('../../server/psql/models/wallet');
const { check, validationResult } = require('express-validator');
const {validateToken} = require('../../server/psql/middleware/auth');

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
  
    
    const path =`m/49'/1'/0'/0`; // we use  `m/49'/1'/0'/0` for testnet network
    const hdPath =  require('./libs/path');
    const wallet = {};
    
    //let mnemonic = bip39.generateMnemonic()
    let comb = pass + user;
    let _passphrase = walletModel.getWallet(data.wallet_id)
    const matchPwd = bcrypt.compareSync(String(comb), encrypted);
       //validTx.passphrase == cryptPwd ? true : false;
       if (!matchPwd) {
         return errorResponse(401,"passphrase_wrong", {message : "wrongPassphrase"});
       }

    let kystr = CryptoJS.AES.decrypt(mnemonic, pinHash(comb));
    const _mnemonic = kystr.toString(CryptoJS.enc.Utf8); 
    const wallet_eth = hdkey.EthereumHDKey.fromMnemonic(_mnemonic, pinHash(comb));
    console.log(wallet_eth.getWallet().getAddressString()) 
    const eth_address = wallet_eth.getWallet().getAddressString();
  
    wallet.wallet_id = wallet_id;
    wallet.mnemonic = CryptoJS.AES.encrypt(_mnemonic, pinHash(comb)).toString();
    wallet.username = user;
    wallet.passphrase = bcrypt.hashSync(String(comb), saltRounds);
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
  
   
   
    return successResponse(201,wallet, 'walletCreated');
    } catch(error){
      console.error('error -> ', logStruct('createETHTestCr', error))
      return errorResponse(error.status, error.message);
    }
    }


    router.post('/create/wallet',  async(req, res, next) => {
        console.log(req.body);
        const { username, wallet_id, mnemonic, passphrase, encrypted} = req.body
        const wallet = await createETHTestCr(username, wallet_id, mnemonic, passphrase, encrypted);
      
        return res.status(wallet.status).send(wallet.data);
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
    const calculateEthPrices = async (data) => {
      try {
         const httpProvider = new Web3.providers.HttpProvider(provider.sepolia);
         const web3 = new Web3(httpProvider);
         const bal_eth = await web3.eth.getBalance(data.address);
         console.log(bal_eth);
         //bal_eth 
         let bal_eth_wei = Number(bal_eth);
         console.log(bal_eth_wei);
         //let bal_wei =  web3.utils.toWei(bal_eth_wei, "ether");
         let bal_wei = bal_eth_wei * Math.pow(10, -18);
         console.log(bal_wei);
         let bal = {}
         bal.wallet_id = data.wallet_id;
         bal.crypto = "eth";
         bal.address = data.address;
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
       
        return successResponse(200, bal, {wallet_id: bal.wallet_id, eth_balance : bal.balance, usd_balance : bal.usd})
      } catch (error) {
        console.error('error -> ', logStruct('calculateEthPrices', error))
        return errorResponse(error.status, error.message);
      }
     }


     router.post('/get/balance', async(req, res, next) => {

      const respBal = await calculateEthPrices(req.body); 

      return res.status(respBal.status).send(respBal.data)
    });

    router.get('/get/addr/balance', async (req, res, next) => {
      const response = await calculateEthPrices(req.body);
      return res.status(response.status).send(response)
    });




    module.exports = router;