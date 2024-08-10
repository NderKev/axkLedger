const express = require('express');

const axkXrp = express();

axkXrp.use(express.urlencoded({extended: true})); 
axkXrp.use(express.json());

const wallet = require('./wallet');
axkXrp.use('/axk/xrp', wallet);

axkXrp.use((req, res, next) => {
    res.status(404).send({
      success : false,
      message : 'notFound',
      type : 'axkXrp Ledger',
      action: req.method+' '+req.originalUrl,
      data : [],
      meta:{}
    });
  });
  
  // error handler
  axkXrp.use((err, req, res, next) => {
    if(err && err.status==520){
      return next();
    }
    console.error({
      type : 'uncaughtException',
      err:err
    }, 'doeremi uncaughtException');
    res.status(520).send({
      success : false,
      message : 'somethingWentWrong',
      type : 'axkXrp Ledger',
      action: 'uncaughtException'
    });
  });
  
  
  module.exports = axkXrp;