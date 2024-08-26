const express = require('express');
const cors = require('cors');


require('dotenv').config({ path: '../.env'});




const DEBUG = process.env.DEBUG || false;
if(!DEBUG){
  console.info = () => {}
}


const app = express();


app.use(cors());

app.use(express.urlencoded({extended: true})); 
app.use(express.json());

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

const btcWalletRoute = require('./btc/createWallet');
app.use('/axkledger/v1/btc', btcWalletRoute);
const btcStatusRoute = require('./btc/checkStatus');
app.use('/axkledger/v1/btc', btcStatusRoute);
const btcRelayRoute = require('./btc/relayBTC');
app.use('/axkledger/v1/btc', btcRelayRoute);
const ethCreateRoute = require('./eth/create_eth_wallet');
app.use('/axkledger/v1/eth', ethCreateRoute);
const ethEscrowRoute = require('./eth/send_eth_escrow');
app.use('/axkledger/v1/eth', ethEscrowRoute);
const axkLiskRoute = require('./lisk/routes/axkLisk');
app.use('/axkledger/v1/lisk', axkLiskRoute);
const axkXrpRoute = require('./xrp/wallet');
app.use('/axkledger/v1/xrp', axkXrpRoute);


app.use((req, res, next) => {
    res.status(404).send({
      success : false,
      message : 'notFound',
      type : 'axkledger Blockchain',
      action: req.method+' '+req.originalUrl,
      data : [],
      meta:{}
    });
  });
  

  // error handler
  app.use((err, req, res, next) => {
    if(err && err.status==520){
      return next();
    }
    console.error({
      type : 'uncaughtException',
      err:err
    }, 'axkledger uncaughtException');
    res.status(520).send({
      success : false,
      message : 'somethingWentWrong',
      type : 'axkledger BD',
      action: 'uncaughtException'
    });
  });
  
  
  module.exports = app;
  