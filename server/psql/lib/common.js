const {errorResponse, successResponse} = require('./response');
const cache = require('./cache');
const userModel = require('../models/users');
const userController = require('../controllers/users');

const logStruct = (func, error) => {
  return {'func': func, 'file': 'commonLib', error}
}

exports.authenticator = async (req, res, next) => {
  try {
    if (!req.session || !req.session.user_roles || !req.session.jwt || !req.session.jwt_exp) {
        return res.status(401).send(errorResponse({message : "logged out"}));
    }

    const cacheData = await cache.get(req.sessionID);

    if (!cacheData) {
      const expiry = parseInt(process.env.SESS_LIFETIME)/1000 || 60 * 5;
      await cache.set(req.sessionID, req.session, expiry)
    };

    next();

  } catch (error) {
    console.error('error -> ', logStruct('authenticator', error))
    return res.status(401).send(errorResponse(401));
  }

}

exports.auth_wallet = async (req, res, next) => {
  try {
    if (!req.session.wallet_id|| !req.session.btc_balance || !req.session.kes_balance){
        return res.status(401).send(errorResponse(401));
    }

    next();

  } catch (error) {
    console.error('error -> ', logStruct('auth_wallet', error))
    return res.status(401).send(errorResponse(401));
  }

}

exports.auth_balance = async (req, res, next) => {
  try {
    if (!req.session.user_id|| !req.session.wallet_id){
        return res.status(401).send(errorResponse(401));
    }

    next();

  } catch (error) {
    console.error('error -> ', logStruct('auth_balance', error))
    return res.status(401).send(errorResponse(401));
  }

}

exports.auth = async (req, res, next) => {
  try {
    //req.body.user_id = req.session.user_id;
    //req.body.email = req.session.email;
    const resp = await userController.updateToken(req.body.email)
    console.log(resp);
    if (resp && resp.meta) {
      req.session.jwt = resp.meta.token;
    }
  else {
     return res.status(401).send(errorResponse(401));
  }
    next();

  } catch (error) {
    console.error('error -> ', logStruct('auth', error))
    return res.status(401).send(errorResponse(401));
  }

}

exports.auth_ver = async (req, res, next) => {
  try {
    //req.body.token = req.headers.jwt;
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== "undefined"){
      const bearer = bearerHeader.split(' ');
      const jwt = bearer[1];
      let resp = await userController.verifyToken(jwt)
      console.log(resp.data);
      if (!resp.success && resp.status == 403 && resp.message == "mismatch"){
        return errorResponse(403, {message: "mismatch"});
    }
    if (resp.success && resp.data.message == "expired") {
       let reqId = resp.data.email;
       resp = await userController.updateToken(reqId)
    }
    req.body.email = resp.data.email;
    req.body.username = resp.data.email;
    req.body.user_id = resp.data.password;
  }
  else {
     return res.status(401).send(errorResponse({message : "invalidJWT"}));
  }
    next();

  } catch (error) {
    console.error('error -> ', logStruct('ver_tkn', error))
    return res.status(401).send(errorResponse(401));
  }

}



exports.allowCustomer = (req, res, next) => {
  if (!req.session || !req.session.user_roles || !req.session.user_roles.length ||
    req.session.user_roles !== "customer") {
      return res.status(401).send(errorResponse(401));
  }
  next();
}

exports.allowAdmin = (req, res, next) => {
  if (!req.session || !req.session.user_roles || !req.session.user_roles ||
    req.session.user_roles !== "admin") {
      return res.status(401).send(errorResponse(401));
  }
  next();
}



/** exports.routeUser = (req, res, next) => {
  if (!req.session || !req.session.user_roles || !req.session.user_roles.length ||
    req.session.user_roles.indexOf('admin') < 0) {
      return  res.render(__dirname + "/" + "pages/admin.html");//res.status(401).send(errorResponse(401));
  }
  else if (!req.session || !req.session.user_roles || !req.session.user_roles.length ||
    req.session.user_roles.indexOf('seller') < 0) {
      return  res.render(__dirname + "/" + "pages/addProduct.html");
    }
    else{
      return  res.render(__dirname + "/" + "pages/complete_profile.html");
    }
  next();
} **/


