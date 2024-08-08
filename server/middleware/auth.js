const jwt = require('jsonwebtoken');
const config = require('../config');


const validateToken = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) return res.status(401).json({ msg: 'Unauthorized request!' });

  try {
    jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.status(401).json({ msg: 'Unauthorized request!' });
        console.error(err);
      } else {
        req.user = decoded.user;
        next();
      }
    });
  } catch (err) {
    console.error('Internal auth error - error in token validation middleware');
    res.status(500).json({ msg: 'Internal auth error' });
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
};

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
    console.error('Internal auth error - error in token validation middleware');
    res.status(500).json({ msg: 'Internal auth error' });
  }
};

const validateTokenVideo = (req, res, next) => {
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


/** const validateAddress = (req, res, next) => {
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
  validateTokenMeta,
  validateBearerToken,
  validateTokenVideo,
  validateTokenTransaction
};
