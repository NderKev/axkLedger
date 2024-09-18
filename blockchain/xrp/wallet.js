const { Client, Wallet } = require('xrpl');
const express = require('express');
const CryptoJS = require("crypto-js");
const pinHash = require('sha256');
const bcrypt = require('bcryptjs');
const walletModel = require('../../server/psql/models/wallet');
const userModel = require('../../server/psql/models/users');
const { check, validationResult } = require('express-validator');
const {validateToken} = require('../../server/psql/middleware/auth');
const {authenticateUser} = require('../../server/psql/controllers/auth');
const router  = express.Router();
const {successResponse, errorResponse} = require('./libs/response');
   const logStruct = (func, error) => {
    return {'func': func, 'file': 'wallet', error}
  }
  
  const createXrpWalletTestNet = async() => {
    try
    { 
          // Define the network client
        const client = new Client("wss://s.altnet.rippletest.net:51233")
        await client.connect()

        const wallet = Wallet.generate()
        const fund_result = await client.fundWallet(wallet);
        const test_wallet = fund_result.wallet
        let _wallet =
            {
              "wallet" : wallet,
              "fund_result" : fund_result,
              "test_wallet" : test_wallet
            }
        return successResponse(200, _wallet, {"wallet" : _wallet}, "wallet created");

        // Disconnect when done (If you omit this, Node.js won't end the process)
        await client.disconnect()
     }catch (error) {
            console.error('error -> ', logStruct('createXrpWalletTestNet', error))
            return errorResponse(error.status, error.message);
          }
  }
  
  router.get('/wallet/test/create', validateToken, async(req, res, next) => {
    const response = await createXrpWalletTestNet();
    return res.status(response.status).send(response)
  });

  const createFundXrpWalletTestNet = async(req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
    }

    try
    { 
          // Define the network client
          
        const auth_xrp = await authenticateUser(req, res);
        const client = new Client("wss://s.altnet.rippletest.net:51233");
        await client.connect()
        let keystrl = CryptoJS.AES.decrypt(auth_xrp.wallet.mnemonic, pinHash(auth_xrp.comb));
        const keystore = keystrl.toString(CryptoJS.enc.Utf8);
        const _wallet = Wallet.fromMnemonic(keystore);
        const fund_result = await client.fundWallet(_wallet);
        const test_wallet = fund_result.wallet
        console.log(fund_result);
        const address = test_wallet.classicAddress;
        const pubKey = CryptoJS.AES.encrypt(test_wallet.publicKey, pinHash(comb)).toString();
        const privKey = CryptoJS.AES.encrypt(test_wallet.privateKey, pinHash(comb)).toString();
        const balance = fund_result.balance;
        let wallet =
            { 
              "wallet_id" : req.body.wallet_id,
              "address" : address,
              "pubKey" : pubKey,
              "privKey" : privKey,
              "balance" : balance
            }

        const walletExists = await walletModel.checkXRP({wallet_id : wallet.wallet_id, address : address});

        if (walletExists && walletExists){
          return res.status(403).json({ msg : 'xrpExists' });
        }

        await walletModel.createXRP({wallet_id : wallet.wallet_id, pubKey : pubKey, privKey : privKey, balance : balance});
        await walletModel.cryptoBalance({wallet_id : wallet.wallet_id, crypto : "xrp", address : wallet.address});
        return successResponse(200, wallet, {"wallet" : wallet}, "wallet created and funded");

        // Disconnect when done (If you omit this, Node.js won't end the process)
        await client.disconnect()
     }catch (error) {
            console.error('error -> ', logStruct('createFundXrpWalletTestNet', error))
            return errorResponse(error.status, error.message);
          }
  }

  router.post('/wallet/test/fund', validateToken, [
    check('wallet_id', 'Wallet id is required').not().isEmpty(),
    check('passphrase', 'Please include a passphrase').not().isEmpty()
    //check('username', 'Username is required').not().isEmpty()
  ], async(req, res, next) => {
    const response = await createFundXrpWalletTestNet(req, res);
    return res.status(response.status).send(response)
  });

  const getXrpWalletTestNetAccountInfo = async(req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
    }
    try
    { 
          // Define the network client
        const auth_xrp = await authenticateUser(req, res);
        let kystr = CryptoJS.AES.decrypt(auth_xrp.wallet.mnemonic, pinHash(auth_xrp.comb));
        const _mnemonic = kystr.toString(CryptoJS.enc.Utf8); 
        const client = new Client("wss://s.altnet.rippletest.net:51233")
        await client.connect()
        const wallet = Wallet.fromMnemonic(_mnemonic);
          // Get info from the ledger about the address we just funded
        const response = await client.request({
            "command": "account_info",
            "account": wallet.address,
            "ledger_index": "validated"
        })
        console.log(response)
        
        let _response =
            {
              "wallet_id" : data.wallet_id,
              "address" : wallet.address,
              "balance" : response.result.account_data.Balance
            }
        return successResponse(200, _response, {"info" : _response}, "wallet account info");

        // Disconnect when done (If you omit this, Node.js won't end the process)
        await client.disconnect()
     }catch (error) {
            console.error('error -> ', logStruct('getXrpWalletTestNetAccountInfo', error))
            return errorResponse(error.status, error.message);
          }
  }

  router.post('/wallet/test/account', validateToken, [
    check('wallet_id', 'Wallet id is required').not().isEmpty(),
    check('passphrase', 'Please include a passphrase').not().isEmpty()
  ], async(req, res, next) => {
    const response = await getXrpWalletTestNetAccountInfo(req, res);
    return res.status(response.status).send(response);
  });



  const createPaymentXrpTestnet = async(req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
    }
    try
    { 
       
          // Define the network client
        const auth_xrp = await authenticateUser(req, res);
        let kystr = CryptoJS.AES.decrypt( auth_xrp.wallet.mnemonic, pinHash(auth_xrp.comb));
        const _mnemonic = kystr.toString(CryptoJS.enc.Utf8); 
        const client = new Client("wss://s.altnet.rippletest.net:51233")
        await client.connect()
        const wallet = Wallet.fromMnemonic(_mnemonic);
          // Get info from the ledger about the address we just funded
      
        const toAddress = req.body.to || null;
        let toXrp = "";
        if ( toAddress && toAddress !== "null"){
           toXrp = toAddress;
        }
        else {
           toXrp = process.env.XRP_ESCROW_ACCOUNT;
        }

        const tx = {
          TransactionType: "Payment",
          Account: wallet.address,
          Amount: xrpToDrops(req.body.amount),
          Destination: toXrp
        };
      
          // Submit the transaction --------------------------------------------
          console.log("Submitting the transaction (Takes 3-5 seconds)");
          const submitted_tx = await client.submitAndWait(tx, {
            autofill: true, // Adds in fields that can be automatically set like fee and last_ledger_sequence
            wallet: wallet
          });
        // Check transaction results -----------------------------------------
        console.log(
          "Transaction result:",
          submitted_tx.result.meta.TransactionResult
        );
        // Look up the new account balances by sending a request to the ledger
          const account_info = await client.request({
            command: "account_info",
            account: wallet.address
          });

          // See https://xrpl.org/account_info.html#account_info ---------------
          const balance = account_info.result.account_data.Balance;
          console.log(`New account balance: ${balance} drops`);
          console.log("Numeric Balance :" + dropsToXrp(balance))
              
              let _response =
                  {
                    "txResult" : submitted_tx.result.meta.TransactionResult,
                    "details" : submitted_tx,
                    "amount" : req.body.amount,
                    "destination" : toXrp
                  }
              return successResponse(200, _response, {"info" : _response}, "xrp payment transaction info");

              // Disconnect when done (If you omit this, Node.js won't end the process)
              await client.disconnect()
    }catch (error) {
        console.error('error -> ', logStruct('createPaymentXrpTestnet', error))
        return errorResponse(error.status, error.message);
    }
  }

  router.post('/test/payment', validateToken, [
    check('wallet_id', 'Wallet id is required').not().isEmpty(),
    check('passphrase', 'Please include a passphrase').not().isEmpty(),
    check('amount', 'Amount is required').isNumeric().not().isEmpty()
  ], async(req, res, next) => {
    const response = await createPaymentXrpTestnet(req, res);
    return res.status(response.status).send(response)
  });

  router.post('/test/transfer', validateToken, [
    check('wallet_id', 'Wallet id is required').not().isEmpty(),
    check('passphrase', 'Please include a passphrase').not().isEmpty(),
    check('amount', 'Amount is required').isNumeric().not().isEmpty(),
    check('to', 'Destination address is required').isAlphanumeric().not().isEmpty(),
  ], async(req, res, next) => {
    const response = await createPaymentXrpTestnet(req, res);
    return res.status(response.status).send(response)
  });

  module.exports = router;
