const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const {isAddress} = require("web3-validator");
const farmers = require('../models/farmers');



/** const generateUniqueFarmerId = (length)=> {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        id += characters[randomIndex];
    }
    return id;
  }

  exports.createFarmer = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { name } = req.body;
    //const nameMatch = email.match(/^([^@]*)@/);
   // const name = nameMatch ? nameMatch[1] : null;
    //req.body.name = name;
    console.log(name);
    const wallet_id  = generateUniqueFarmerId(32);
    console.log(wallet_id);
    try {
      const farmerExists = await farmerModel.checkFarmerExists(req.user.wallet_id);
      if (farmerExists && farmerExists.length) {
        return res.status(403).json({ msg : 'farmerExists' });
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
      let role_id = 2;
      if (role === "buyer"){
         role_id = 3;
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
      /** try {
        await sendEmail(email, WelcomeMail(name));
      } catch (error) {
        console.log(error);
      } 
      return res.json({token , msg : 'user registered'});
      
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ msg: 'Internal server error create user' });
    }
  }; **/

  exports.createFarmerToken = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const validAddress = isAddress(req.body.address);
    if (!validAddress || validAddress === 'null'|| typeof validAddress === 'undefined'){
     return res.status(401).json({ msg: 'Invalid address!' });
    } 
    const { address, wallet_id, token} = req.body;
    
    try {
        const userExists = await farmers.checkFarmerExists(address);
        if (!userExists && !userExists.length) {
          return res.status(403).json({ msg : 'farmer doesnt exist' });
        }
        if (wallet_id !== userExists[0].wallet_id) {
          return res.status(403).json({ msg : 'farmer wallet id mismatch' });
        }
        const tokenExists = await farmers.getCurrentFarmerToken({address : address, token : token});
        if (tokenExists && tokenExists.length) {
          if (token !== tokenExists[0].token) {
            return res.status(403).json({ msg : 'farmer token mismatch' });
          }
          else {
          var timeNow = Math.floor(Date.now() / 1000);
          if (tokenExists[0].expiry <= timeNow){
            const token_new = await farmers.genFarmerToken(auth_token.address);
            await farmers.updateFarmerToken(token_new);
            return res.json({token : token_new, msg : 'token updated'});
          }
          let ver_token = await farmers.verifyToken(token);
          return res.json({token : ver_token})
        }     
       }
        else {
          let auth_token = await farmers.verifyToken(token);
          if (auth_token.valid == true && auth_token.message === "valid"){
            await farmers.createFarmerToken(auth_token);//{address : auth_token.address, wallet_id : auth_token.wallet_id, token : auth_token.token, expiry : auth_token.expiry}
            return res.json({token: auth_token, msg : 'token created'});
          }
          if (auth_token.valid == true && auth_token.message === "expired"){
            const token_exp = await farmers.genFarmerToken(auth_token.address);
            await farmers.updateFarmerToken(token_exp);
            return res.json({token : token_exp, msg : 'token updated'});
          }
          return res.json({token : auth_token, msg : 'token creation invalid'});
        }
        
    }catch (error) {
        console.error(error.message);
        return res.status(500).json({ msg: 'Internal server error create farmer token' });
    }
}

  exports.getFarmer = async (req, res) => {
    try {
      const address  = req.body.address;
      console.log(address);
      const farmer = await farmers.getFarmerDetailsByAddress(address);
      return res.status(200).json(farmer);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Internal server error get user');
    }
  };


  exports.getFarmers = async (req, res) => {
    try {
      //const address  = req.body.address;
      //console.log(address);
      const list_farmers = await farmers.getAllFarmers();
      return res.status(200).json(list_farmers);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Internal server error get all farmers');
    }
  };

