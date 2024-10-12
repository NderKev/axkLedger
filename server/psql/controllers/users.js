const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { WelcomeMail } = require('../../mails');
const users = require('../models/users');
const transactions = require('../models/transactions');
const sendEmail = require('../../helpers/sendMail');
const nodemailer = require('nodemailer');
const config = require('../config');




exports.generateUniqueId = function(length){
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        id += characters[randomIndex];
    }
    return id;
  }


  exports.createUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { email, password} = req.body;
    const nameMatch = email.match(/^([^@]*)@/);
    const name = nameMatch ? nameMatch[1] : null;
    //req.body.name = name;
    const role = "buyer";
    console.log(name);
    const wallet_id  = this.generateUniqueId(32);
    console.log(wallet_id);
    try {
      const userExists = await users.checkUserExists(email);
      if (userExists && userExists.length) {
        return res.status(403).json({ msg : 'userExists' });
      }
      const salt = await bcrypt.genSalt(10);
      const _password = bcrypt.hashSync(String(password), salt);
      let input = {
        name : name,
        email : email,
        password : _password,
        wallet_id : wallet_id,
        role : role
      }

      await users.createUser(input);
      await users.createBuyer(wallet_id);
      const token =  await users.genToken(input.wallet_id);
      await users.createUserToken(token);
      const email_ver_token = await users.genVerToken(input.email);
      //await users.createEmailToken(email_ver_token);
      const otp = generateOTP(6);
      await users.createEmailToken({email : email_ver_token.email, expiry : email_ver_token.expiry, token : otp});
      email_ver_token.token = otp;
     // const link = `${req.protocol}://${req.get('host')}${req.originalUrl}/verify/${email_ver_token.token}`;
      //const bd_link = `http://102.133.149.187/backend/users/verify/${email_ver_token.token}`
      const link = `http://102.133.149.187/backend/users/otp/${otp}`;
      console.log("otp  :" + otp);
       try {
        await sendEmail(email, WelcomeMail(name, link, otp));
      } catch (error) {
        console.log(error);
      } 

      const resp_user = {
        user : email,
        token : token,
        verification_token : email_ver_token
      };

      return res.json({resp_user , msg : 'user registered'});
      
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ msg: 'Internal server error create user' });
    }
  };

  exports.createProfilePicture = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //const { wallet_id, address, tx_hash, mode, value, fiat} = req.body;
    try {
      const usr = req.user, adm = req.admin;
      let walletid;
      if (usr){
        walletid = usr.wallet_id;
      }
      else {
        walletid = adm.wallet_id
      }
      if (req.body.wallet_id !== walletid) {
        return res.status(403).json({ msg : 'user wallet id mismatch' });
      }
      //req.body.wallet_id == walletid;  
      const response = await users.createUserProfilePicture(req.body);
      return res.status(200).json(response);
    } catch (error) {
      console.error('createProfilePicture', error.message);
      return res.status(error.status).json(error.message);
    }
  };

  exports.createEmailToken = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //const { wallet_id, address, tx_hash, mode, value, fiat} = req.body;
    try {
      const usr = req.user, adm = req.admin;
      let walletid;
      if (usr){
        walletid = usr.wallet_id;
      }
      else {
        walletid = adm.wallet_id
      }
     const curr_user_email = await users.getDetailsByWalletId(walletid);
     const token = await users.genVerToken(curr_user_email[0].email);
     await users.createEmailToken(token);
      //req.body.wallet_id == walletid;  
      const response = {
          token : token,
          status : "created"
      }
      return res.status(200).json(response);
    } catch (error) {
      console.error('createEmailToken', error.message);
      return res.status(error.status).json(error.message);
    }
  };

  exports.sendVerification = async (req, res) => {
    try {
     //let testAccount = await nodemailer.createTestAccount();
      const {token , email} = req.body;
      const fetch_user = await users.fetchUserName(email);
      const user = fetch_user[0].name;
      let transporter = nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        secure: true, // true for 465, false for other ports
        auth: {
          user: config.SMTP_USER, // generated ethereal user
          pass: config.SMTP_PW, // generated ethereal password
        },
      });
      const AUTH_URL = `http://102.133.149.187/backend/users/verify`;//http://102.133.149.187/backend/users/verify//localhost:9000/axkledger/v1/api/users/verify
      const auth_link = `${req.protocol}://${req.get('host')}${req.originalUrl}/verify/:${token}`;
      const link = `${AUTH_URL}/:${token}`;
      console.log(auth_link +" : " + link);
      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: `${config.FROM_NAME}👻 <${config.FROM_EMAIL}>`,//'"Verification 👻" <no-reply@doeremi.com>', // sender address
        to: email, //"nostrakelvin@gmail.com" // list of receivers
        subject: "Please Verify Your Afrikabal Account ✔", // Subject line
        text: "Hello " + user , // plain text body
        html: "Hello " + user +",<br> You've successfully created an afrikabal account from this email.<br><a href="+link+">Click here to verify your email</a>", // html body
      });
      console.log("Message sent: %s", info.messageId); 
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  
      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
      return res.status(200).json({info , msg : 'verification sent'});
      //return successResponse(200, info, 'sent')
    } catch (error) {
      //console.error('error -> ', logStruct('sendVerfication', error))
      //return errorResponse(error.status, error.message);
      console.error(error.message);
      return res.status(500).json({ msg: 'Internal server error send email verification user' })
    }
  };
  
  exports.sendResetEmailToken = async (req, res) => {
    try {
     //let testAccount = await nodemailer.createTestAccount();
     const userExists = await users.checkUserExists(req.body.email);
      if (userExists && userExists.length) {
      //const {user, email} = reqData;
      let user = config.SMTP_USER;
      let user_id = userExists[0].id;
      let token = await users.genVerToken(req.body.email);
      await users.createEmailToken(token);
       
      let transporter = nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        secure: true, // true for 465, false for other ports
        //service: config.SMTP_HOST,
        auth: {
          user: config.SMTP_USER, // generated ethereal user
          pass: config.SMTP_PW, // generated ethereal password
        },
      });
      const AUTH_URL = `localhost:8000/axkledger/v1/api/users/forgot_password`;//http://102.133.149.187/backend/users/forgot_password
      const link = `${AUTH_URL}/:${token.token}`;
      console.log(link);
      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: `"Support 👻" + <${config.FROM_EMAIL}>`, // sender address
        to: req.body.email, //"nostrakelvin@gmail.com" // list of receivers
        subject: "Please Reset Your Password For Afrikabal Account ✔", // Subject line
        text: "Hello " + token.user , // plain text body
        html: "Hello " + token.user +",<br> Please Click on the link to reset your afrikabal account password.<br><a href="+link+">Click here to reset your password</a>", // html body
      });
      console.log("Message sent: %s", info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  
      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
      //return successResponse(200, info, 'sent')
      await users.resetPassword({email : req.body.email, token : token.token});
      return res.status(200).json({info , msg : 'verification sent'});
    }
    else {
       return res.status(400).json({ msg: 'user_not_exists' });
    }
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ msg: 'Internal server error reset password user' })
    }
  };

  exports.updateProfile = async (req, res) => {
    try {
      const userExists = await users.checkUserExists(req.user.wallet_id);
      if (userExists && userExists.length) {
        const response = await users.updateProfile(req.body);
        return  res.status(204).json({ response, msg: 'profileUpdated'}); 
      }
      else{
      return res.status(403).json({ msg: 'userNotRegistered' });
      }
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ msg: error.message });
    }
  };
  
  exports.updatePassword = async (req, res) => {
    try {
      const userExists = await users.checkUserExists(req.body.email);
      if (userExists && userExists.length) {
        const salt = await bcrypt.genSalt(10);
        const _password = bcrypt.hashSync(String(req.body.password), salt);
        const response = await users.updatePassword({email: req.body.email, password: _password});
        return  res.status(204).json({ response, msg: 'passwordUpdated'}); 
      }
      else{
      return res.status(403).json({ msg: 'userNotRegistered' });
      }
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ msg: error.message });
    }
  };


  exports.verifyToken = async(req, res) => {
    try {
      var data = {}, token = {}; 
      const response = await users.verifyEmailToken(req.params.token);
      if (response.message == "error" || response.valid == false || response.message == "expired"){
        return res.status(403).json({ msg: "token invalid or expired" });
      }
      token.token = response.token;
      data.email = response.email;
      token.email = response.email;
      data.wallet_id = response.wallet_id;
      data.verified = 1;
      token.used = 1;
      await users.verifyEmailTokenDb(token);
      await users.verifyEmail(data);
      return res.status(202).json({ response, msg: 'verified'}); 
  } catch (error) {
      console.error(error.message);
      return res.status(500).json({ msg: error.message });
    }
  };
  
  exports.verifyResetToken = async(req, res) => {
    try {
      const response = await users.verifyEmailToken(req.params.token);
      if (response.message == "error" || response.valid == false || response.message == "expired"){
        return res.status(403).json({ msg: "token invalid or expired" });
      }
      let data = {
        email: response.email,
        token : response.token
      }
      req.body.email = response.email;
      await users.verifyEmailTokenDb(data);
      return res.status(202).json({ response, msg: 'verified'}); 
  } catch (error) {
      console.error(error.message);
      return res.status(500).json({ msg: error.message });
    }
  };


  exports.resetPassword = async (req, res) => {
    try {
      const userExists = await users.checkUserExists(req.body.email);
      if (userExists && userExists.length) {
        const _salt = await bcrypt.genSalt(10);
        const new_pwd = bcrypt.hashSync(String(req.body.password), _salt);
        const response = await users.setPassword({email : req.body.email, token : req.params.token, password : new_pwd});
        return  res.status(204).json({ response, msg: 'passwordReset Success'}); 
      }
      else{
      return res.status(403).json({ msg: 'userNotRegistered' });
      }
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ msg: error.message });
    }
  };
  

  exports.changePassword = async (req, res) => {
    try {
      const userExists = await users.checkUserExists(req.user.wallet_id);
      if (userExists && userExists.length) {
        const curr_pwd = req.body.password;
        const old_pwd = await users.fetchUserPassword(req.user.wallet_id);
        let new_pwd = req.body.new_password;
        const isMatch = await bcrypt.compare(String(curr_pwd ), old_pwd[0].password);
        if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Incorrect current password' }] });
        }
        const isUnique = await bcrypt.compare(String(new_pwd ), old_pwd[0].password);
        if (isUnique) {
          return res.status(400).json({ errors: [{ msg: 'New password is not unique' }] });
        }
        const _salt = await bcrypt.genSalt(10);
        new_pwd = bcrypt.hashSync(String(new_pwd), _salt);
        const response = await users.changePassword({wallet_id : req.user.wallet_id, password : new_pwd});
        return  res.status(204).json({ response, msg: 'passwordChange Success'}); 
      }
      else{
      return res.status(403).json({ msg: 'userNotRegistered' });
      }
    } catch (error) {
      console.error(error.message);
      return res.status(error.status).json({ msg: error.message });
    }
  };

  exports.getUserProfile = async (req, res) => {
    try {
      const wallet_id  = req.user.wallet_id;
      console.log(wallet_id);
      const profile = await users.fetchUserProfile(wallet_id);
      return res.status(200).json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(err.status).send('Internal server error get user profile');
    }
  };

  exports.getUserTransactions = async (req, res) => {
    try {
      const wallet_id  = req.user.wallet_id;
      console.log(wallet_id);
      const txs = await transactions.getTransactionByWalletId(wallet_id);
      return res.status(200).json(txs);
    } catch (err) {
      console.error(err.message);
      return res.status(err.status).send('Internal server error get user transactions');
    }
  };

  exports.getUserTransactionDetails = async (req, res) => {
    try {
      const hash  = req.body.hash;
      console.log(hash);
      const txs = await transactions.getTransactionByHash(hash);
      return res.status(200).json(txs);
    } catch (err) {
      console.error(err.message);
      return res.status(err.status).send('Internal server error get user transaction details');
    }
  };

  exports.getUserCompleteTransactions = async (req, res) => {
    try {
      const wallet_id  = req.user.wallet_id;
      console.log(wallet_id);
      const txs = await transactions.getCompletedTxs(wallet_id);
      return res.status(200).json(txs);
    } catch (err) {
      console.error(err.message);
      return res.status(err.status).send('Internal server error get user complete transactions');
    }
  };


  exports.getUserPendingTransactions = async (req, res) => {
    try {
      const wallet_id  = req.user.wallet_id;
      console.log(wallet_id);
      const txs = await transactions.getPendingTxsUser(wallet_id);
      return res.status(200).json(txs);
    } catch (err) {
      console.error(err.message);
      return res.status(err.status).send('Internal server error get user pending transactions');
    }
  };


  const generateOTP = (length)=> {
    const characters = '0123456789';
    let lot_num = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        lot_num += characters[randomIndex];
    }
    let date = moment().format('YYYY/MM/DD');
    console.log(date);
    return lot_num;
  }

  exports.createEmailOTP = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //const { wallet_id, address, tx_hash, mode, value, fiat} = req.body;
    try {
      const usr = req.user, adm = req.admin;
      let walletid;
      if (usr){
        walletid = usr.wallet_id;
      }
      else {
        walletid = adm.wallet_id
      }
     const curr_user_email = await users.getDetailsByWalletId(walletid);
     const token = await users.genVerToken(curr_user_email[0].email);
     let otp = generateOTP(6);
     token.token = otp;
     await users.createEmailToken({email : curr_user_email[0].email, expiry : token.expiry, token : otp});
      //req.body.wallet_id == walletid;  
      const response = {
          token : token,
          status : "created"
      }
      return res.status(200).json(response);
    } catch (error) {
      console.error('createEmailOTP', error.message);
      return res.status(error.status).json(error.message);
    }
  };

  exports.verifyOTP = async(req, res) => {
    try {
      var data = {}, token = {}; 
      const response = await users.getOtpToken(req.params.otp);
      var time_now = Math.floor(Date.now() / 1000);
      const user_wid = await users.getUserDetailsByEmail(response[0].email);
      if (response.length <= 0 || user_wid.length <= 0  || response[0].expiry < time_now){
        return res.status(403).json({ msg: "otp invalid or expired" });
      }
      token.token = response[0].token;
      data.email = response[0].email;
      token.email = response[0].email;
      data.wallet_id = user_wid[0].wallet_id;
      data.verified = 1;
      token.used = 1;
      await users.verifyEmailTokenDb(token);
      await users.verifyEmail(data);
      return res.status(202).json({ response, msg: 'verified'}); 
  } catch (error) {
      console.error(error.message);
      return res.status(500).json({ msg: error.message });
    }
  };