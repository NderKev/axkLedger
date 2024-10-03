const express  = require('express');
const router  = express.Router();
const axios = require('axios');
const userModel = require('../../models/users');
const {validateToken} = require('../../middleware/auth');


router.post('/user', validateToken, async(req, res) => {
    const file = req.files.user;
    const fileName = req.files.user.name;
    const serverPath = '/public/image/user/' + fileName;
    console.log(file);
    const upload = file.mv(serverPath, (error) => {
      if (error) {
        console.error(error)
        res.writeHead(500, {
          'Content-Type': 'application/json'
        })
        res.end(JSON.stringify({ status: 'error', message: error }))
        return
      }
  
      res.writeHead(200, {
        'Content-Type': 'application/json'
      })
      res.end(JSON.stringify({ status: 'success', path: serverPath }));
    }); 
    
    if (upload && upload.status === 'success') {
      await userModel.createUserProfilePicture({wallet_id : req.user.wallet_id, path : serverPath, name : fileName})
      return res.status(200).json({ msg : 'user profile picture uploaded succesfully' });
    }
    
});

module.exports = router;