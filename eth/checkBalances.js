var express = require('express');
const contractAddress = require('./libs/usdtContract');
var Web3 = require('web3');
const TokenCoin = require('./libs/usdtContractAbi');
const provider = require('./libs/provider');
const Contract = require('web3-eth-contract');
const router  = express.Router();
const {successResponse, errorResponse} = require('../libs/response');
   const logStruct = (func, error) => {
    return {'func': func, 'file': 'checkBalance', error}
  }

//Initialize the web3 provider using localhost RPC and an Infura RPC Fallback
// var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545" || provider));
var web3 = new Web3(new Web3.providers.HttpProvider(provider.provider));
//const contract = web3.eth.contract(TokenCoin);
//const TransferTokens = require('./libs/usdtContractAbi');
const contract = new Contract(TokenCoin, contractAddress);


/**
Function/Module Name : checkBalances
Purpose : is a POST Api endpoint that determines Transaction status of eth and ERC20 tokens
Input: user's Ethereum address
Output :  the user's Ether and Token Balance
**/

router.post('/balances/checkBalances', function(req, res){
    try
    {

         //var keystore = lightwallet.keystore.deserialize(req.body.keystore);
          var address = req.body.address;
          if (address == null){
               res.send("Kindly provide the user's Address");
            }

          web3.setProvider(new Web3.providers.HttpProvider(provider.provider));
              let ethBalance = web3.eth.getBalance(address);
              ethBalance = ethBalance.toNumber();
              ethBalance = ethBalance * Math.pow(10, -18);
              console.log("User's ETH balance is" + " "  + ethBalance)
             
              let output =
            {
              "ethBalance" : ethBalance
            }

            res.send(output);

      }
    catch(err){
              console.log(err.message);
              res.send(err.message);
            }
    finally{
              var time = new Date(Date.now()).toUTCString();
               //console.log(time);
              console.log("CheckBalances.js [checkBalances] is executed at UTC Time :" + time);
	}
});

/**
Function/Module Name : TokenBalances
Purpose : A POST  API endpoint for checking the User's Token or any ERC20 token balance
Input: the user's Ethereum address
Output : the user's ERC20 token Balance
**/

router.post('/balances/TokenBalances', function(req, res){
  try
  {
        var address = req.body.address;
        const TokenContractAddress = req.body.contractAddress;
        const decimals = req.body.decimals;

        if (address == null || TokenContractAddress == null){
        	res.send("Invalid or incorrect input");
	        }
          /**
          tokenBalancesPromise is an assynchornous function that accepts user address and Token contract address
          It returns the numeric value of the  user's ERC20  token Balance
          **/
    function tokenBalancesPromise(user_addr, token_addr, Decimals) {
      return new Promise((resolve, reject) => {
            const OtherToken = contract.at(token_addr);
            const TransferERC = CheckBal.at(token_addr);
            var TokenBalance = TransferERC.balanceOf.call(user_addr).toNumber();
            //console.log(TokenBalance);
             TokenBalance = TokenBalance * Math.pow(10, -Decimals);

            //console.log(TokenBalance);
            var output =
          {
            TokenBalance : TokenBalance

          }
            return resolve(output);
          });
        }
          var ResultPromise = new Promise((resolve, reject) => {
            var balanceDetails = tokenBalancesPromise(address,TokenContractAddress, decimals);
            resolve(balanceDetails);
          })
          ResultPromise.then(function(balanceDetails){
            res.send(balanceDetails);
          })
    }
  catch(err){
//            console.log(err.message);
            res.send(err.message);
          }
  finally{
         var time = new Date(Date.now()).toUTCString();
            console.log("CheckBalances.js [TokenBalances] UTC Response Timestamp : " + time);
  }
});

router.post('/balances/bulkTokenBalances', function (req, res) {
    try {
        var address = req.body.address;
        console.log("request: " + req);
        console.log("Address: " + req.body.address);
        var contractAddresslistarray = req.body.contractAddressList;
        console.log("AddressList: " + req.body.contractAddressList);
        var contractDecimalarray = req.body.contractDecimalList;
        console.log("contractDecimalarray: " + req.body.contractDecimalList);
        var contractTicker = req.body.TickerList;

        const addressLength = contractAddresslistarray.length;
        if (contractAddresslistarray.length != contractDecimalarray.length) {
            res.send("Invalid JSON Array");
        }
        if (address == null || contractAddresslistarray == null) {
            res.send("Invalid or incorrect input");
        }
        /**
        tokenBalancesPromise is an assynchornous function that accepts user address and Token contract address
        It returns the numeric value of the  user's  ERC20  token Balance
        **/
        var Data = new Object();
        console.log("Data Array Before" + Data);
        var promises = []

        function bulktokenBalancesPromise(user_addr, contractAddresslistarray, contractDecimalarray) {
            return new Promise((resolve, reject) => {
                for (var i = 0; i < addressLength; i++) {
                    const token_addr = contractAddresslistarray[i];
                    const Decimals = contractDecimalarray[i];
                    const ticker = contractTicker[i];
                    console.log('\n', ticker, token_addr, Decimals);
                    var p = new Promise(function (resolve, reject) {
                        try {
                            const TransferERC = CheckBal.at(token_addr);
                            var TokenBalance = TransferERC.balanceOf.call(user_addr).toNumber();
                            TokenBalance = TokenBalance * Math.pow(10, -Decimals);
                            console.log("Data :" + TokenBalance);
                            resolve({
                                'ticker': ticker,
                                'tokenBalance': TokenBalance
                            });

                        } catch (err) {
                            console.log("Data : Error getting balance", token_addr);
                            resolve({
                                'ticker': ticker,
                                'tokenBalance': 0
                            });
                        }
                    });
                    promises.push(p);

                }
                let ethBalance = web3.eth.getBalance(user_addr);
                ethBalance = ethBalance.toNumber();
                ethBalance = ethBalance * Math.pow(10, -18);
                console.log("User's ETH balance is" + " "  + ethBalance)


                Promise.all(promises).then(function (values) {
                    console.log(values);
                    let output = {
                        TokenBalances: values
                    }
                    resolve(output);
                });
            });
        }
        var ResultPromise = new Promise((resolve, reject) => {
            var balanceDetails = bulktokenBalancesPromise(address, contractAddresslistarray, contractDecimalarray);
            resolve(balanceDetails);
        })
        ResultPromise.then(function (balanceDetails) {
            res.send(balanceDetails);
        })
    } catch (err) {
        console.log(err.message);
        res.send(err.message);
    } finally {
        var time = new Date(Date.now()).toUTCString();
        console.log("CheckBalances.js [TokenBalances] UTC Response Timestamp : " + time);
    }
});



/**
Function/Module Name : getTxStatus
Purpose : is a POST Api endpoint that determines Transaction status of eth and ERC20 tokens
Input: Transaction Hash
Output : The status of the transaction: "success", "fail", or "pending";
**/
router.post('/balances/getTxStatus', function(req, res){
  try
  {
    web3.setProvider(new Web3.providers.HttpProvider(provider.provider));
     const txHash = req.body.txHash;
      web3.eth.getTransactionReceipt(txHash, function(err, receipt){
            if (!err) {
              if (receipt == null) {
              res.send({"status":"pending"});
              } else {
                var receiptStatus = receipt.status;
                if(receiptStatus == 0x1) {
                res.send({"status":"success"});
                }
                else if (receiptStatus == 0x0) {
              res.send({"status":"fail"})
              }
            }
          } else {
          console.log(err);
          res.send({"error" : "true"});
            }
          });
      }
 finally{
     var time = new Date(Date.now()).toUTCString();
     console.log("CheckBalances.js [getTxStatus] Executed at UTC Time :" + time);
   }
})

module.exports = router;
