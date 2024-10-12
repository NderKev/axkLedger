
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { WelcomeMail } = require('../../mails');
const users = require('../models/users');
const wallet = require('../models/wallet');
const userController = require('./users');
const CryptoJS = require("crypto-js");
const pinHash = require('sha256');
const sendEmail = require('../../helpers/sendMail');

exports.createAdminUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { email, password} = req.body;
    const nameMatch = email.match(/^([^@]*)@/);
    const name = nameMatch ? nameMatch[1] : null;
    console.log(name);
    const wallet_id  = userController.generateUniqueId(32);
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
        wallet_id : wallet_id
      }

      await users.createUser(input);
      let role_id = 1;
      await users.createPermission({wallet_id: wallet_id, role_id: role_id});
      const token =  await users.genToken(input);
      await users.createUserToken(token);
      //const user_name = await users.fetchUserName(wallet_id);
       try {
        await sendEmail(email, WelcomeMail(name));
      } catch (error) {
        console.log(error);
      } 
        const resp_adm = {
          user : email,
          token : token
        };
      return res.json({resp_adm , msg : 'admin user registered'});
      
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ msg: 'Internal server error create admin user' });
    }
  };


  exports.updateUserPermission = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { wallet_id, user_role, role_id } = req.body;
    try {
      const userExists = await users.checkUserExists(wallet_id);
      if (!userExists && !userExists.length) {
        return res.status(403).json({ msg : 'userNotExists' });
      }
      if (user_role === "admin" || role_id == 1){
        return res.status(404).json({ msg : 'forbidden Request' });
      }

      let input = {
        role_id : role_id,
        wallet_id : wallet_id
      }

      await users.updatePermission(input);
      //const user_name = await users.fetchUserName(wallet_id);
      /** try {
        await sendEmail(email, WelcomeMail(name));
      } catch (error) {
        console.log(error);
      } **/
      return res.json({input , msg : ' user permission updated'});
      
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ msg: 'Internal server error update user permission' });
    }
  };


  exports.getUserPermission = async (req, res) => {
    try {
      const wallet_id  = req.user.wallet_id;
      console.log(wallet_id);
      const user = await users.getUserPermission(wallet_id);
      return res.status(200).json(user);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Internal server error get user permission');
    }
  };

  exports.getUserPermissions = async (req, res) => {
    try {
      const user = await users.getUserPermissions();
      return res.status(200).json(user);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Internal server error get user permissions');
    }
  };

  exports.getUserRoles = async (req, res) => {
    try {
      const user = await users.getUserRoles();
      return res.status(200).json(user);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Internal server error get user roles');
    }
  };

  exports.getBuyers = async (req, res) => {
    try {
      const buyers = await users.getBuyers();
      return res.status(200).json(buyers);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Internal server error get buyers');
    }
  };

  exports.createUserRole = async (req, res) => {
    try {
      const role = req.body.role;
      if (role !== 'admin' && role !== 'buyer' && role !== 'buyer'){
        return res.status(403).json({ msg : 'userRoleInvalid' });
        }
      const user = await users.createUserRole(req.body.role);
      return res.status(200).json(user);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Internal server error create user roles');
    }
  };


  exports.updateUserRole = async (req, res) => {
    try {
      const user = await users.updateUserRole(req.body);
      return res.status(200).json(user);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Internal server error update user roles');
    }
  };

  exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { email, password } = req.body;
   
    try {
      const user = await users.getUserDetailsByEmail(email);
      //console.log(user);
      if (!user && !user.length) {
        return res.status(400).json({ errors: [{ msg: 'User not registered yet' }] });
      }
      
      if (user[0].id != 1){
        return res.status(403).json({ errors: [{ msg: 'user id flagged contact admin for asistance' }] });
      }

      let role_response = await users.getUserPermission(user[0].wallet_id);
      //console.log(role_response);
      if (!role_response || !role_response.length){
        //await users.createPermission({wallet_id: user[0].wallet_id, role_id: 1});
        //role_response = await users.getUserPermission(user[0].wallet_id);
        return res.status(403).json({ msg : 'forbidden Request' });
      }
      if (role_response[0].role !== 'null' &&  role_response[0].role !== 'admin'){
        return res.status(403).json({ msg : 'forbidden Request' });
      }
      const isMatch = await bcrypt.compare(String(password), user[0].password);
  
      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials login user' }] });
      }
      const isFlagged = await users.isWalletIdFlagged(user[0].wallet_id);
      //console.log(isFlagged[0].flag)
      if (isFlagged[0].flag !== 'null' && isFlagged[0].flag === 1){
        return res.status(403).json({ errors: [{ msg: 'user flagged contact admin for asistance' }] });
      }
     
      const token = await users.updateToken(user[0].wallet_id);
      console.log("token :" + token.token);
      let pinSet = true;
      let pin = user[0].pin;
      if (typeof pin === 'undefined' || pin === null || pin == 'null'){
         pinSet = false;
        }
      const user_roles = role_response.map(el => el.role);
      console.log(user_roles[0]);
      return res.json({token , pin : pinSet, user_roles : user_roles[0]});

      
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ msg: 'Internal server error login admin' });
    }
  };

  exports.createAdminPin = async(req , res) => {
    try {
      const wallet_id = req.admin.wallet_id;
      console.log(wallet_id);
      const pin_set = await users.fetchUserPin(wallet_id);
      const res_pin = pin_set[0].pin;
      console.log(res_pin);
      if (res_pin !== 'null' && res_pin !== null ){
        return res.status(403).json({ msg : 'pinExists' });
      }
      let str = req.body.pin + req.admin.wallet_id + req.admin.user;
      let pinStr = req.body.pin + req.admin.user;
      const pn = pinHash(str);
      const pword = pinHash(pinStr);
      const encrPin = CryptoJS.AES.encrypt(pn, pword).toString();
      //req.body.pin = encrPin;
      const response = await users.setUserPin({wallet_id : wallet_id, pin : encrPin }); 
      return res.json({response , msg : 'admin pin created'});
  } catch (error) {
      console.error(error.message);
      return res.status(500).json({ msg: 'Internal server error create admin pin' });
    }
  };

  exports.getAdminPin = async(req, res) => {
    try {
      const response = await users.fetchUserPin(req.admin.wallet_id);
      let pin = response[0].pin;
      if (typeof pin === 'undefined' || pin === null || pin == 'null'){
        return res.status(401).json({ msg: 'pinNotSet' });
      }
      return res.json({pin : pin , msg : 'pinSet'});
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ msg: 'Internal server error get admin pin' });
    }
  };

  exports.getAdmin = async (req, res) => {
    try {
      const wallet_id  = req.admin.wallet_id;
      console.log(wallet_id);
      const user = await users.getDetailsByWalletId(wallet_id);
      return res.status(200).json(user);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Internal server error get admin');
    }
  };


  exports.deleteUser = async (req, res) => {
    try {
      const email  = req.body.email;
      console.log(email);
      const fetchUser = await users.getDetailsByWalletId(req.admin.wallet_id);
      const _email = fetchUser[0].email;
      const fetchWid = await users.getUserDetailsByEmail(email);
      const eml = fetchWid[0].email, wallet_id = fetchWid[0].wallet_id;
      if ( _email == email && eml == email){
        return res.status(403).json({ msg : 'unauthorized delete admin' });
      }
      await users.deleteFromUserPermission(wallet_id);
      await users.deleteUserToken(wallet_id);
      await wallet.deleteCryptoBalance(wallet_id);
      await users.deleteUser(email);
      
      return res.status(200).json({user : email, msg : "deleted"});
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Internal server error delete user');
    }
  };


  exports.deleteFarmer = async (req, res) => {
    try {
      const wallet_id  = req.body.wallet_id;
      console.log(wallet_id);
      const user = await farmer.deleteFarmer(wallet_id);
      return res.status(200).json(user);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Internal server error delete user');
    }
  };

  