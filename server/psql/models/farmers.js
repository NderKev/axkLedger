const db = require('../models/db');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const farmerModel = require('../models/farmers');
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
  
  exports.checkFarmerNameLocationExists = async (data) => {
    const query = db.read.select('axk_sc_farmers.wallet_id', 'axk_sc_farmers.address')
    .from('axk_sc_farmers')
    .where('name', '=', data.name)
    .where('location', '=', data.location);
    return query;
  };
  
  exports.getFarmerDetailsByNameOrAddress = async (input) => {
    const query = db.read.select('*')
    .from('axk_sc_farmers')
    .where('name', '=', input)
    .orWhere('address', '=', input);
    return query;
  };
  
  exports.getAllFarmers = async () => {
    const query = db.read.select('axk_sc_farmers.*')
    .from('axk_sc_farmers')
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
        private_key : data.private_key,
        public_key : data.public_key,
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
      verified: data.verified || 1,
      updated_at : moment().format('YYYY-MM-DD HH:mm:ss')
    });
    console.info("query -->", query.toQuery())
    return query;
  };
  
  exports.createFarmerToken = async (data) => {
    const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    const query = db.write('axk_sc_farmers_jwt').insert({
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
    const query = db.write('axk_sc_farmers_jwt')
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
    const query = db.read.select('axk_sc_farmers_jwt.wallet_id', 'axk_sc_farmers_jwt.token', 'axk_sc_farmers_jwt.expiry')
    .from('axk_sc_farmers_jwt')
    .where('wallet_id', '=', data)
    .orWhere('address', '=', data);
    console.info("query -->", query.toQuery())
    return query;
  };

  exports.getCurrentFarmerToken = async (data) => {
    const query = db.read.select('axk_sc_farmers_jwt.wallet_id', 'axk_sc_farmers_jwt.token', 'axk_sc_farmers_jwt.expiry')
    .from('axk_sc_farmers_jwt')
    .where('token', '=', data.token)
    .where('address', '=', data.address);
    console.info("query -->", query.toQuery())
    return query;
  };

  exports.getJWTFarmerToken = async (data) => {
    const query = db.read.select('axk_sc_farmers_jwt.wallet_id', 'axk_sc_farmers_jwt.address', 'axk_sc_farmers_jwt.token', 'axk_sc_farmers_jwt.expiry')
    .from('axk_sc_farmers_jwt')
    .where('token', '=', data.token);
    //.where('address', '=', data.address);
    console.info("query -->", query.toQuery())
    return query;
  };

  exports.sleep = function(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
  }

 exports.getExpiryDate = function(token){  
    try{
    var tokenVer = {};
    jwt.verify(token, config.FRM_SECRET, (err, decoded) => {
      if(err) throw err;
      else{
      tokenVer.data = decoded;
      //console.log(tokenVer)
    } 
  });
  return tokenVer;
} catch(err){
  console.error(err.message);
  //res.status(500).json({ msg: 'Internal server error login user' });
  tokenVer.error = err.message;
  return tokenVer;
}
 }

exports.createToken = function(data){
  try{ 
    var tokenData = {};
    jwt.sign(
      data,
      config.FRM_SECRET,
      { expiresIn: config.JWT_FARMER_EXPIRY },
      (err, token) => {
        if (err) throw err;
        tokenData.token = token;
      },
  );
    return tokenData;
  }catch(err){
     console.error(err.message);
     tokenData.error = err.message;
     return tokenData;
}
}

exports.genFarmerToken = async (reqData) => {
  //const validInput = validateDetails.validateAuth(reqData);
  const farmerExists = await farmerModel.checkFarmerExists(reqData);
  console.log(farmerExists);
  var token = {};
  if (farmerExists && farmerExists.length) {
    const payload = {
      farmer: {
        wallet_id: farmerExists[0].wallet_id,
        address : farmerExists[0].address
      },
    };
    var token_farmer =  farmerModel.createToken(payload);
    await sleep(1000);
   if (token_farmer){
     var tkFrmExp =  this.getExpiryDate(token_farmer.token);
     await sleep(1000);
     //console.log(tkExp);
     token.address = farmerExists[0].address;
     token.wallet_id = farmerExists[0].wallet_id;
     token.expiry = tkFrmExp.data.exp;
     token.token = token_farmer.token;

     //console.log(token);
   }
// }
return token;
}

}

exports.verifyToken = async (token) => {
  try{
   var valid = false;
   var resp = {};
  jwt.verify(token, config.FRM_SECRET, (err, decoded) => {
    if(err) {
       resp.token = token;
       resp.expiry = 0;
       resp.valid = valid;
       resp.wallet_id = token;
       resp.address = token;
       resp.message = "error";
       return resp;
    }
    else{
    //tokenVer.
    var data = decoded;
    console.log(data);
    var expiry_date = data.exp;//getExpDate(token);
    //await sleep(1000);
    let _walletid = data.farmer.wallet_id;
    let _address = data.farmer.address;
    var timeNow = Math.floor(Date.now() / 1000);
    if (expiry_date <= timeNow){
      valid = true;
      resp.token = token;
      resp.expiry = expiry_date;
      resp.valid = valid;
      resp.wallet_id = _walletid;
      resp.address = _address;
      resp.message = "expired";
    }
    else {
      valid = true;
      resp.token = token;
      resp.expiry = expiry_date;
      resp.valid = valid;
      resp.wallet_id = _walletid;
      resp.address = _address;
      resp.message = "valid";
    }

  }
})
return resp;
//console.log(tokenVer);
}
catch(err){
  resp.token = token;
  resp.expiry = 0;
  resp.valid = valid;
  resp.wallet_id = token;
  resp.address = token;
  resp.message = "error";
  return resp;
}
}