const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { WelcomeMail } = require('../../mails');
const users = require('../models/users');
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
  
    const { email, password, role } = req.body;
    const nameMatch = email.match(/^([^@]*)@/);
    const name = nameMatch ? nameMatch[1] : null;
    //req.body.name = name;
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
      let role_id = 3;
      if (role === "farmer"){
        return res.status(404).json({ msg : 'forbidden Request' });
      }
      if (role === "admin") {
        return res.status(404).json({ msg : 'forbidden Request' });
      }
      const checkRole = await users.checkUserRole(role);
      if (!checkRole || !checkRole.length){
      await users.createUserRole({role : role});
      }
      await users.createPermission({wallet_id: wallet_id, role_id: role_id});
      const token =  await users.genToken(input);
      await users.createUserToken(token);
      //const user_name = await users.fetchUserName(wallet_id);
       try {
        await sendEmail(email, WelcomeMail(name));
      } catch (error) {
        console.log(error);
      } 
      return res.json({token , msg : 'user registered'});
      
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ msg: 'Internal server error create user' });
    }
  };

  exports.sendVerification = async (reqData) => {
    try {
     //let testAccount = await nodemailer.createTestAccount();
      const {token , user, email} = reqData;
      let transporter = nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        secure: true, // true for 465, false for other ports
        auth: {
          user: config.SMTP_USER, // generated ethereal user
          pass: config.SMTP_PW, // generated ethereal password
        },
      });
      const AUTH_URL = `http://agro-africa.io/agroAfrica/v1/user/verify`;
      const link = `${AUTH_URL}/${email}/${token}`;
      console.log(link);
      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: `${config.FROM_NAME}👻 <${config.FROM_EMAIL}>`,//'"Verification 👻" <no-reply@doeremi.com>', // sender address
        to: email, //"nostrakelvin@gmail.com" // list of receivers
        subject: "Please Verify Your Afrikabal Account ✔", // Subject line
        text: "Hello" + user , // plain text body
        html: "Hello" + user +",<br> You've successfully created and afrikabal account from this email.<br><a href="+link+">Click here to verify your email</a>", // html body
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
  
  exports.resetPassword = async (reqData) => {
    try {
     //let testAccount = await nodemailer.createTestAccount();
     const userExists = await users.getUserDetailsByEmail(reqData.email);
      if (userExists && userExists.length) {
      //const {user, email} = reqData;
      let user = config.SMTP_USER;
      let user_id = userExists[0].id;
      let token = await users.genVerToken(reqData.email);
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
      const AUTH_URL = `http://localhost:3000/reset_password`;//142.93.194.112/doeremi/v1/btc/usr
      const link = `${AUTH_URL}/${token.token}`;
      console.log(link);
      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: `"Support 👻" + <${config.FROM_EMAIL}>`, // sender address
        to: reqData.email, //"nostrakelvin@gmail.com" // list of receivers
        subject: "Please Reset Your Password For Afrikabal Account ✔", // Subject line
        text: "Hello " + token.user , // plain text body
        html: "Hello " + token.user +",<br> Please Click on the link to reset your doeremi account password.<br><a href="+link+">Click here to reset your password</a>", // html body
      });
      console.log("Message sent: %s", info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  
      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
      //return successResponse(200, info, 'sent')
      return res.status(200).json({info , msg : 'verification sent'});
    }
    else {
       return res.status(400).json({ msg: 'user_not_exists' })
      //return errorResponse(400, "invalid user", {message : "user_not_exists"});
    }
    } catch (error) {
      //console.error('error -> ', logStruct('resetPassword', error))
      //return errorResponse(error.status, error.message);
      console.error(error.message);
      return res.status(500).json({ msg: 'Internal server error reset password user' })
    }
  };

  




  