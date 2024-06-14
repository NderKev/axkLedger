const { Client, Wallet } = require('xrpl');
const express = require('express');
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
        let _wallet =
            {
              "wallet" : wallet
            }
        return successResponse(200, _wallet, {"wallet" : _wallet}, "wallet created");

        // Disconnect when done (If you omit this, Node.js won't end the process)
        await client.disconnect()
     }catch (error) {
            console.error('error -> ', logStruct('createXrpWalletTestNet', error))
            return errorResponse(error.status, error.message);
          }
  }
  
  router.get('/wallet/test/create', async(req, res, next) => {
    const response = await createXrpWalletTestNet();
    return res.status(response.status).send(response)
  });

  const createFundXrpWalletTestNet = async() => {
    try
    { 
          // Define the network client
        const client = new Client("wss://s.altnet.rippletest.net:51233")
        await client.connect()
        //const _wallet = Wallet.fromSeed("sn3nxiW7v8KXzPzAqzyHXbSSKNuN9")
        const fund_result = await client.fundWallet()
        const test_wallet = fund_result.wallet
        console.log(fund_result)
        let wallet =
            {
              "wallet" : test_wallet,
              "result" : fund_result
            }
        return successResponse(200, wallet, {"wallet" : wallet}, "wallet created and funded");

        // Disconnect when done (If you omit this, Node.js won't end the process)
        await client.disconnect()
     }catch (error) {
            console.error('error -> ', logStruct('createFundXrpWalletTestNet', error))
            return errorResponse(error.status, error.message);
          }
  }

  router.get('/wallet/test/fund', async(req, res, next) => {
    const response = await createFundXrpWalletTestNet();
    return res.status(response.status).send(response)
  });

  const getXrpWalletTestNetAccountInfo = async(wallet) => {
    try
    { 
          // Define the network client
        const client = new Client("wss://s.altnet.rippletest.net:51233")
        await client.connect()
          // Get info from the ledger about the address we just funded
        const response = await client.request({
            "command": "account_info",
            "account": wallet.address,
            "ledger_index": "validated"
        })
        console.log(response)
        let _response =
            {
              "wallet" : wallet.address,
              "details" : response
            }
        return successResponse(200, _response, {"info" : _response}, "wallet account info");

        // Disconnect when done (If you omit this, Node.js won't end the process)
        await client.disconnect()
     }catch (error) {
            console.error('error -> ', logStruct('getXrpWalletTestNetAccountInfo', error))
            return errorResponse(error.status, error.message);
          }
  }

  router.post('/wallet/test/account', async(req, res, next) => {
    const response = await getXrpWalletTestNetAccountInfo(req.body.wallet);
    return res.status(response.status).send(response)
  });




  module.exports = router;
