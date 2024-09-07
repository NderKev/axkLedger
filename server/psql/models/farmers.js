const db = require('../models/db');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const userModel = require('../models/users');
const config = require('../config');


exports.getFarmerByWalletId = async (data) => {
    const query = db.read.select('axk_sc_farmers.*')
    .from('axk_sc_farmers')
    .where('wallet_id', '=', data);
    return query;
  };
  
  exports.getFarmerDetailsByAddress = async (address) => {
    const query = db.read.select('*')
    .from('axk_sc_farmers')
    .where('address', '=', address);
    return query;
  };
  
  
  exports.checkFarmerExists = async (data) => {
    const query = db.read.select('axk_sc_farmers.wallet_id', 'axk_sc_farmers.address')
    .from('axk_sc_farmers')
    .where('address', '=', data)
    .orWhere('wallet_id', '=', data);
    return query;
  };
  
  
  exports.getFarmerDetailsByNameOrAddress = async (input) => {
    const query = db.read.select('*')
    .from('axk_sc_farmers')
    .where('name', '=', input)
    .orWhere('address', '=', input);
    return query;
  };
  
  exports.createFarmer = async (data) => {
    const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    const query = db.write('axk_sc_farmers').insert({
      wallet_id: data.wallet_id,
      address: data.address,
      name: data.name,
      location: data.location,
      private_key: data.private_key,
      public_key : data.public_key,
      key : data.key,
      verified: data.verified || 0,
      created_at: createdAt,
      updated_at: createdAt
    });
    console.info("query -->", query.toQuery())
    return query;
  };

  exports.updateFarmerKey = async (data) => {
    const query = db.write('axk_sc_farmers')
      .where('address', data.address)
      .update({
        key : data.key,
        updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
      });
    console.info("query -->", query.toQuery())
    return query;
  };
  
  exports.verifyFarmer = async (data) => {
    const query = db.write('axk_sc_farmers')
      .where('address', data.address)
      .update({
      name : data.name,
      location : data.location,
      verified: data.verified || 1,
      updated_at : moment().format('YYYY-MM-DD HH:mm:ss')
    });
    console.info("query -->", query.toQuery())
    return query;
  };
  
  exports.createFarmerToken = async (data) => {
    const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    const query = db.write('axk_sc_jwt').insert({
      address : data.address,
      wallet_id : data.wallet_id,
      token: data.token,
      expiry: data.expiry,
      created_at: createdAt,
      updated_at: createdAt
    });
    console.info("query -->", query.toQuery())
    return query;
  };
  
  exports.updateFarmerToken = async (data) => {
    const query = db.write('axk_sc_jwt')
      .where('address', data.address)
      .update({
        token : data.token,
        expiry : data.expiry,
        updated_at : moment().format('YYYY-MM-DD HH:mm:ss')
      });
    console.info("query -->", query.toQuery())
    return query;
  };
  
  exports.getFarmerToken = async (data) => {
    const query = db.read.select('axk_sc_jwt.wallet_id', 'axk_sc_jwt.token', 'axk_sc_jwt.expiry')
    .from('axk_auth_jwt')
    .where('wallet_id', '=', data)
    .orWhere('address', '=', data);
    console.info("query -->", query.toQuery())
    return query;
  };



 exports.getExpiryDate = function(token){
   var tokenVer = {};
    try{
    jwt.verify(token, config.FRM_SECRET, (err, decoded) => {
      if(err) throw err;
      else{
      tokenVer.data = decoded;
      //console.log(tokenVer)
    } 
  });
  return tokenVer;
} catch(err){
  tokenVer.error = err.message;
  return tokenVer;
}
 }

exports.createToken = function(data){
  var token = {};
  try{ 
    jwt.sign(
      data,
      config.FRM_SECRET,
      { expiresIn: config.JWT_FARMER_EXPIRY },
      (err, token) => {
        if (err) throw err;
        token.token = token;
      },
    );
    return token;
  }catch(err){
     token.error = err.message;
     return token;
}
}