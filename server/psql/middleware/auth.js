const jwt = require('jsonwebtoken');
const config = require('../config');
//const farmerModel = require('../models/farmers');

const validateToken = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) return res.status(401).json({ msg: 'Unauthorized request!' });
  
  try {
    jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.status(401).json({ msg: 'Unauthorized request!' });
        console.error(err);
      } else {
        const role = decoded.data.role;
        if (role !== "null" && role !== "buyer"){
           return res.status(401).json({ msg: 'Only Buyer Allowed!' });
        }
        req.user = decoded.data;
        req.user.token = token;
        next();
      }
    });
  } catch (err) {
    console.error('Internal auth error in user token validation middleware');
    res.status(500).json({ msg: 'Internal auth error user' });
  }
};

const validateAdmin = (req, res, next) => {
  const token = req.header('x-admin-token'); 
  if (!token ) return res.status(403).json({ msg: 'Unauthorized request!' });
  try {
    jwt.verify(token, config.ADM_SECRET, (err, decoded) => {
      if (err) {
        res.status(401).json({ msg: 'Unauthorized request!' });
        console.error(err);
      } else { 
        const role = decoded.data.role;
        if (role !== "admin" ){
          res.status(404).json({ msg: 'Only Admin allowed!'});
        }
        req.admin = decoded.data;
        req.admin.token = token;    
        next();
      }
    });
  } catch (err) {
    console.error('Internal auth error in admin token validation middleware');
    res.status(500).json({ msg: 'Internal auth error admin' });
  }
};

const validateFarmer = (req, res, next) => {
  const token = req.header('x-farmer-token');
  if (!token) return res.status(401).json({ msg: 'Unauthorized request!' });
  try {
    jwt.verify(token, config.FRM_SECRET, (err, decoded) => {
      if (err) {
        res.status(401).json({ msg: 'Unauthorized request!' });
        console.error(err);
      } else {
         req.farmer = decoded.farmer;
         req.farmer.token = token;
        next();
      }
    });
  } catch (err) {
    console.error('Internal auth error in token validation middleware');
    res.status(500).json({ msg: 'Internal auth error farmer' });
  }
};

/**  const validateFarmerExists = async(req, res, next) => {
  const walletid = req.body.wallet_id; 
  if (!walletid) return res.status(404).json({ msg: 'Unauthorized request!' });
  const frm_token = await farmers.getFarmerToken(walletid);
  if (!frm_token && !frm_token.length) return res.status(403).json({ msg: 'Unexisting farmer jwt db!' });
  let data = req.body;
  let farmer;
  if (data.farmer && !data.address){
    farmer = data.farmer;
  }
  if (data.address && !data.farmer){
      farmer = data.address;
  }
  if (!data.address && !data.farmer){
     data = req.farmer;
     farmer = data.address;
  }
   //farmer = req.body.farmer || req.body.address || req.farmer.address;
  const farmers = await farmerModel.checkFarmerExists(farmer);
  if (!farmers || !farmers.length) return res.status(401).json({ msg: 'Farmer doesnt exist!' });
  try { 
        
        let payload = {
          farmer : {
            wallet_id: farmers[0].wallet_id,
            address : farmers[0].address
          }
        }
        const token =  farmerModel.createToken(payload);
        const expiry_date =  farmerModel.getExpiryDate(token.token);
        await farmerModel.updateFarmerToken({address : farmer, token : token.token, expiry: expiry_date.data.exp});
        req.farmer.wallet_id = farmers[0].wallet_id;
        req.farmer.address = farmers[0].address;
        req.token = token.token;
        //req.token = token;
        next();
      } catch (err) {
    console.error(err.message + 'Internal auth error in token validation farmer middleware');
    res.status(500).json({ msg: err.message + ' : Internal auth error farmer' });
  }
};
const validateTokenMeta = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) return res.status(401).json({ msg: 'Unauthorized request!' });

  try {
    jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.status(401).json({ msg: 'Unauthorized request!' });
        console.error(err);
      } else {
        req.meta = decoded.meta;
        next();
      }
    });
  } catch (err) {
    console.error('Internal auth error - error in token validation middleware');
    res.status(500).json({ msg: 'Internal auth error' });
  }
}; **/

const validateBearerToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  const bearer = bearerHeader.split(' ');
  const jwt = bearer[1];

  if (typeof bearerHeader !== "undefined" || !jwt) return res.status(401).json({ msg: 'Unauthorized request!' });

  try {
    jwt.verify(jwt, config.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.status(401).json({ msg: 'Unauthorized request!' });
        console.error(err);
      } else {
        req.meta = decoded.meta;
        next();
      }
    });
  } catch (err) {
    console.error('Internal auth error  in token validation middleware');
    res.status(500).json({ msg: 'Internal auth error' });
  }
};

/** const validateTokenVideo = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) return res.status(401).json({ msg: 'Unauthorized request!' });

  try {
    jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.status(401).json({ msg: 'Unauthorized request!' });
        console.error(err);
      } else {
        req.video = decoded.video;
        next();
      }
    });
  } catch (err) {
    console.error('Internal auth error - error in token validation middleware');
    res.status(500).json({ msg: 'Internal auth error' });
  }
};


const validateTokenTransaction = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) return res.status(401).json({ msg: 'Unauthorized request!' });

  try {
    jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.status(401).json({ msg: 'Unauthorized request!' });
        console.error(err);
      } else {
        req.transaction = decoded.transaction;
        next();
      }
    });
  } catch (err) {
    console.error('Internal auth error - error in token validation middleware');
    res.status(500).json({ msg: 'Internal auth error' });
  }
};


const validateAddress = (req, res, next) => {
  const address = req.body.address;

  if (!address) return res.status(401).json({ msg: 'null address request!' });

  try {
     //const isvalid = isAddress(address);
    validator.isAddress(address, (err, result) => {
      if (err) {
        res.status(401).json({ msg: 'Invalid address!' });
        console.error(err) ;
      } 
      else if (result == false){
        res.status(403).json({ msg: 'Invalid address!' });
        console.log("invalid address" + result) ;
      }
      else {
        req.address = address;
        req.body.address = address;
        next();
      }
    });
  } catch (err) {
    console.error('Internal auth error - error in address validation middleware');
    res.status(500).json({ msg: 'Internal auth error' });
  }
}; **/

module.exports = {
  validateToken,
  validateAdmin,
  validateFarmer,
  validateBearerToken
};
