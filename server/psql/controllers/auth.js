const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const users = require('../models/users');


exports.getUser = async (req, res) => {
    try {
      const wallet_id  = req.user.wallet_id;
      console.log(wallet_id);
      const user = await users.getDetailsByWalletId(wallet_id);
      return res.status(200).json(user);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Internal server error get user');
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
      console.log(user);
      if (!user && !user.length) {
        return res.status(400).json({ errors: [{ msg: 'User not registered yet' }] });
      }
  
      const isMatch = await bcrypt.compare(String(password), user[0].password);
  
      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials login user' }] });
      }
      const isFlagged = await users.isWalletIdFlagged(user[0].wallet_id);
      console.log(isFlagged[0].flag)
      if (isFlagged[0].flag !== 'null' && isFlagged[0].flag === 1){
        return res.status(403).json({ errors: [{ msg: 'user flagged contact admin for asistance' }] });
      }
      let role_response = await users.getUserPermission(user[0].wallet_id);
      console.log(role_response);
      if (!role_response || !role_response.length){
        await users.createPermission({wallet_id: user[0].wallet_id, role_id: 3});
        role_response = await users.getUserPermission(user[0].wallet_id);
      }
      const token = await users.updateToken({wallet_id : user[0].wallet_id, role : role_response[0].role});
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
        return res.status(500).json({ msg: 'Internal server error create user' });
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

  exports.createUserRole = async (req, res) => {
    try {
      //const checkRole = await users.checkUserRole(req.body.role);
      if (checkRole || checkRole.length){
        return res.status(403).json({ msg : 'userRoleExists' });
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
      /** const checkRole = await users.checkUserRole(req.body.role);
      if (checkRole || checkRole.length){
        return res.status(403).json({ msg : 'userRoleExists' });
        } **/
      const user = await users.updateUserRole(req.body);
      return res.status(200).json(user);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Internal server error update user roles');
    }
  };

  