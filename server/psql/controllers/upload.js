
const userModel = require('../models/users');

getFileExtFromMimeType = mimeType => {
    switch ( mimeType ) {
      case "image/jpeg":
        return ".jpeg";
  
      case "image/png":
        return ".png";
  
      default:
        return "";
    }
  }
  
exports.getFilename = mimeType => {
    const fileExt = getFileExtFromMimeType( mimeType );
    return fileExt ? ( Date.now() + fileExt ) : "";
  }

exports.getUserImage = async (req, res) => {
    try {
      const img = await userModel.getUserProfilePicture(req.user.wallet_id);
      res.status(200).json(img);
    } catch (error) {
      res.status(500).json({ error });
    }
  };

exports.getUserImagePath = async (req, res) => {
    try {
      const img = await userModel.getUserProfilePicture(req.user.wallet_id);
      const path = {
        path : img[0].path
      }
      res.status(200).json(path);
    } catch (error) {
      res.status(500).json({ error });
    }
  };
  
exports.uploadUserImage = async (req, res) => {
    try {
      const image = req.file ? req.file.filename : null;
      console.log(image);
      //const { name } = req.body;
      //console.log(name);
      const serverPath = '/public/image/user/' + image;
      console.log(serverPath + " : " + req.user.wallet_id);
      if (!req.file) {
        res.status(400).send("no file uploaded");
      }
      console.log(req.user.wallet_id);
      let user, img = await userModel.getUserProfilePicture(req.user.wallet_id);
      console.log("here");
      console.log(img.length);
      if (img.length <= 0){
        user = await userModel.createUserProfilePicture({wallet_id : req.user.wallet_id, path : serverPath, name : image});
      }
      else {
        user = await userModel.updateUserProfilePicture({wallet_id : req.user.wallet_id, path : serverPath, name : image});
      }
      
      res.status(201).json({ user, message: "data upload successfully" });
    } catch (error) {
      res.status(500).json({ error, message: "internal server error " });
    }
}


exports.uploadUserProduct = async (req, res) => {
    try {
      const image = req.file ? req.file.filename : null;
      console.log(image);
      //const { name } = req.body;
      //console.log(name);
      const serverPath = '/public/image/user/' + image;
      console.log(serverPath + " : " + req.user.wallet_id);
      if (!req.file) {
        res.status(400).send("no file uploaded");
      }
      console.log(req.user.wallet_id);
      let user, img = await userModel.getUserProfilePicture(req.user.wallet_id);
      console.log("here");
      console.log(img.length);
      if (img.length <= 0){
        user = await userModel.createUserProfilePicture({wallet_id : req.user.wallet_id, path : serverPath, name : image});
      }
      else {
        user = await userModel.updateUserProfilePicture({wallet_id : req.user.wallet_id, path : serverPath, name : image});
      }
      
      res.status(201).json({ user, message: "data upload successfully" });
    } catch (error) {
      res.status(500).json({ error, message: "internal server error " });
    }
}