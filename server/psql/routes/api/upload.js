const express  = require('express');
const router  = express.Router();
const path = require('path');
const fileupload = require('express-fileupload');
const {validateToken} = require('../../middleware/auth');
router.use(fileupload());//{safeFileNames: true}

router.post('/user', validateToken, (req, res) => {
    const file = req.files.user;
    const fileName = req.files.user.name;
    const serverPath = '/public/image/user/' + fileName;
    console.log(file);
    file.mv(serverPath, (error) => {
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
    })
});
module.exports = router;