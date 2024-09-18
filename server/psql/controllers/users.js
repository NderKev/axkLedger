const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { WelcomeMail } = require('../../mails');
const users = require('../models/users');
const sendEmail = require('../../helpers/sendMail');


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

  




  