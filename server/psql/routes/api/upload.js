const express  = require('express');
const axios = require('axios').default;
const {validateToken} = require('../../middleware/auth');
const {getFilename, uploadUserImage, getUserImage, getUserImagePath} = require( "../../controllers/upload" );
const config = require('../../config')
const port = config.PORT;
const multer = require( "multer" ),
  FILE_SOURCE_DIR = "./public/images/user",
  FILE_SOURCE_SRV = "./public/images/",
  FILE_UPLOADS_DIR = "./public/images/user",
  FILE_UPLOADS_PRD = "./public/images/products",
  FILE_UPLOADS_KYC = "./public/images/kyc",
  MAX_UPLOAD_SIZE = 5 * 1024 * 1024, // 5MB in bytes
  MAX_UPLOAD_SIZE_IN_MB = `${ MAX_UPLOAD_SIZE / 1024 / 1024 }MB`;
const fsProm = require( "fs/promises" ),
fs = require( "fs" ),
FormData = require( "form-data" );
const { Wallet } = require('@ethereumjs/wallet');
axios.defaults.baseURL = `http://localhost:${ port }`;

// configure multer to save images to disk.
const fileStorageEngine = multer.diskStorage({
  
  // configure the destination directory 
  destination: ( req, file, callback ) => {
    callback( null, FILE_UPLOADS_DIR );
  },

  // configure the destination filename
  filename: ( req, file, callback ) => {
    callback( null, getFilename( file.mimetype ) );
  }

});

// configure multer to handle single file uploads
const uploadSingleFile = multer({
  
  // use the configured file storage option
  storage: fileStorageEngine,

  // skip any files that do not meet the validation criteria
  fileFilter: ( req, file, callback ) => {
    
    if ( file.mimetype !== "image/png" && file.mimetype !== "image/jpeg" ) {
      
      // Store a flag to denote that this file is invalid.
      // Unlike `res.locals`, `req.locals` is not really 
      // a standard express object but we use it here
      // for convenience to pass data to the route handler.
      req.locals = { invalidFileFormat: true };

      // reject this file
      callback( null, false );
    }

    // accept this file
    callback( null, true );

  },

  // configure a max limit on the uploaded file size
  limits: { fileSize: MAX_UPLOAD_SIZE }

}).single( "file" );

const parseJSONReqBody =  express.json({ limit: MAX_UPLOAD_SIZE });
const parseRawReqBody = express.raw({ 
  limit: MAX_UPLOAD_SIZE, 
  type: [ "image/jpeg", "image/png" ] 
});

const upload = multer({ dest: './public/images/user' });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./public/images/user");
  },
  filename: function (req, file, cb) {
    return cb(null, Date.now() + "-" + file.originalname);
  },
});


const uploadPhoto = multer({ storage: storage });

const storageProduct = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./public/images/product");
  },
  filename: function (req, file, cb) {
    return cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploadProduct = multer({ storage: storageProduct });

const storageKYC = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./public/images/kyc");
  },
  filename: function (req, file, cb) {
    return cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploadKYC = multer({ storage: storageKYC });

const router  = express.Router();


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
      await uploadUserImage(req, res);
      return res.status(200).json({ msg : 'user profile picture uploaded succesfully' });
    }
    
});

router.get( "/send-multipart", validateToken,  async ( req, res ) => {
  
  const form = new FormData();

  // read the file and append into the FormData instance.
  //const file = req.file;
  //console.log(file);
  const filename = req.body.name;
  const filepath = `${FILE_SOURCE_DIR}/${filename}`; ///${filename} `${ FILE_SOURCE_DIR }/valid.jpg`; 
  console.log(filepath);
  form.append( "file", fs.createReadStream( filepath ) );

  // append any other metadata
  form.append( "name", filename);
	
  try {
    
    // Send the file using axios.
    // Since we're using the FormData instance, axios will automatically set 
    // the Content-Type header as 'mulitpart/form-data'.
    await axios.post( "/receive-multipart", form );
    //await uploadUserImage(req, res);
		
  } catch ( error ) {
    
    // handle file size and file type validation error response
    if( error.response && error.response.data ) {
      return res.status( error.response.status ).json( error.response.data );
    }

    // handle any generic error
    else {
      return res.status( 500 ).json({ 
        status: "error", 
        message: "Something went wrong while uploading the image.", 
        detail: error 
      });
    }
    
  }

  res.json({ status: "success", message: "File sent successfully." }); 
});

router.post( "/receive-multipart", validateToken, ( req, res ) => {
  
  // `uploadSingleFile` is a middleware but we use it here 
  // inside the route handler because we want to handle errors.
  uploadSingleFile( req, res, err => {
    
    // if uploaded file size is too large or if its format is invalid
    // then respond with a 400 Bad Request HTTP status code.
    if( err instanceof multer.MulterError 
      || ( req.locals && req.locals.invalidFileFormat )
      ) {
        return res.status( 400 ).json({ 
          status: "error", 
          message: `Invalid file format. Please upload a JPEG or PNG image not greater than ${MAX_UPLOAD_SIZE_IN_MB} in size.` 
      });
    }

    // handle any other generic error
    else if ( err ) {
      return res.status( 500 ).json({ 
        status: "error", 
        message: "Something went wrong while uploading the image.", 
        detail: err 
      });
    }
  const imageName = req.file.filename;
  const file = req.file;
  const filepath = FILE_UPLOADS_DIR + "/" + imageName;
  // Save this data to a database probably
  //const response = await uploadUserImage(req, res);
  console.log(file, imageName, filepath)
  const fileUpload = {
    wallet_id : req.user.wallet_id,
    name : imageName,
    file : file,
    path : filepath,
    status: "success" 
  }
  return res.json(fileUpload);
    //res.json({ });
    
  });
});

router.get( "/send-base64", async ( req, res ) => {
  
  // Specify which image to read from the file system 
  // and the value for the Content-Type header for the upload.
  const filepath = `${req.file.filepath}/${req.file.filename}`; //`${ FILE_SOURCE_DIR }/valid.jpg`,
    mimetype = "image/jpeg";
  
  let file = null;
  try {

    // read the file as a base64-encoded string
    file = await fsProm.readFile( filepath, "base64" );    

  } catch ( err ) {

    // respond with a 500 Internal Server Error if something goes wrong
    return res.status( 500 ).json({ 
      status: "error", 
      message: "Error while reading file", 
      error: err 
    });

  }
  
  try {

    // Upload the base64 string as JSON with other metadata.
    // `Content-Type` will automatically be set to "application/json".
    const data = { mimetype, file };
    await axios.post( "/receive-base64", data );

  } catch ( err ) {

    // handle file size
    if( err.response && ( err.response.status == 413 || err.response.status == 400 )) {
      return res.status( 400 ).json({ 
        status: "error", 
        message: "Invalid file. Please upload a JPEG or PNG file less than " + MAX_UPLOAD_SIZE_IN_MB + " in size."
      });
    }
    
    // handle any other generic error
    else {
      return res.status( 500 ).json({ 
        status: "error", 
        message: "Error while uploading file", 
        error: err 
      });
    }

  }

  return res.json({ status: "success", message: "File uploaded and saved successfully." });
});





router.post( "/receive-base64", parseJSONReqBody, async ( req, res ) => {

  // validate if file type is valid. If not, return 400 Bad Request.
  if( req.body.mimetype !== "image/jpeg" && req.body.mimetype !== "image/png" ) {
    return res.status( 400 ).json({ 
      status: "error", 
      message: "Invalid file. Please upload a JPEG or PNG file only."
    });
  }

  // convert the base64-encoded string into binary
  const binaryData = Buffer.from( req.body.file, 'base64' );

  // Set the path where the file should be saved.
  const filename = getFilename( req.body.mimetype ),
    filepath = FILE_UPLOADS_DIR + '/' + filename;

  try {
      
    // write the binary data into a file.
    await fsProm.writeFile( filepath, binaryData );

  } catch ( err ) {
    
    // respond with a 500 Internal Server Error if something goes wrong
    return res.status( 500 ).json({ 
      status: "error", 
      message: "Error while writing the file to disk.", 
      error: err 
    });

  }

  return res.json({ status: "success", message: "File saved successfully." });

});

router.get( "/binary", async ( req, res ) => {

  // Specify which image to read from the file system 
  // and the value for the Content-Type header for the upload.
  const filepath = `${ FILE_SOURCE_SRV }/${req.body.type}/${req.body.name}`,
  headers = { "Content-Type": "image/jpeg" };
  
  let file = null;
  try {

    // Read the binary file data into a "Buffer" object.
    file = await fsProm.readFile( filepath );    

  } catch ( error ) {

    // respond with a 500 Internal Server Error if something goes wrong
    return res.status( 500 ).json({ 
      status: "error", 
      message: "Error while reading file", 
      error 
    });

  }

  try {
    
    // upload the binary data in the request payload
    await axios.post( "/binary", file, { headers });    

  } catch (err) {
    
    // handle file size and file type validation error response
    if( err.response && ( err.response.status == 413 || err.response.status == 400 )) {
      return res.status( 400 ).json({ 
        status: "error", 
        message: "Invalid file. Please upload a JPEG or PNG file less than " + MAX_UPLOAD_SIZE_IN_MB + " in size."
      });
    } 

    // handle any generic error
    else {
      return res.status( 500 ).json({ 
        status: "error", 
        message: "Error while uploading file", 
        error: err 
      });
    }

  }

  return res.json({ status: "success", message: "File sent successfully." });

});

// Configure middleware to parse raw request payloads.


router.post( "/binary", parseRawReqBody, async ( req, res ) => {

  // validate if file type is valid. If not, return 400 Bad Request.
  if( req.headers[ "content-type" ] !== "image/jpeg" 
    && req.headers[ "content-type" ] !== "image/png" 
    ) {
    return res.status( 400 ).json({ 
      status: "error", 
      message: "Invalid file. Please upload a JPEG or PNG file only."
    });
  }
  const type = req.body.type;
  // Set the path where the file should be saved.
  const filename = getFilename( req.header( "Content-Type" ) ),
    filepath = FILE_SOURCE_SRV +'/' + type +'/' + filename;

  try {
    
    // write the binary data from the request body into a file.
    await fsProm.writeFile( filepath, req.body );

  } catch (error) {

    // respond with a 500 Internal Server Error if something goes wrong
    return res.status( 500 ).json({ 
      status: "error", 
      message: "Error while writing the binary file to disk.", 
      error 
    });

  }
  //const imageName = req.file.filename;
  //const file = req.file;
  //const filepath = FILE_UPLOADS_DIR + "/" + imageName;
  // Save this data to a database probably
  //const response = await uploadUserImage(req, res);
  //console.log(file, imageName, filepath)
  const fileUpload = {
    wallet_id : req.user.wallet_id,
    name : req.user.user,
    file : filename,
    path : filepath,
    status: "success",
    message: "File received and saved successfully."
  }
  return res.json(fileUpload);

});




router.post('/image', upload.single('file'), async(req, res) => {
  // 4
  const imageName = req.file.filename
  const description = req.body.name
  const filepath = req.file.filepath;
  // Save this data to a database probably
  //const response = await uploadUserImage(req, res);
  console.log(description, imageName, filepath)
  return res.json({description, imageName, filepath});
})

router.get("/", validateToken,  getUserImage);
router.get("/path", validateToken,  getUserImagePath);
router.post("/upload", validateToken,  uploadPhoto.single("file"), uploadUserImage);
router.post("/product", validateToken,  uploadProduct.single("file"), async(req, res) => {
  // 4
  const imageName = req.file.filename
  const description = req.body.name
  const filepath = req.file;
  // Save this data to a database probably
  //const response = await uploadUserImage(req, res);
  console.log(description, imageName, filepath)
  return res.json({description, imageName, filepath});
});

router.post("/kyc", validateToken,  uploadKYC.single("file"), async(req, res) => {
  // 4
  const imageName = req.file.filename
  const description = req.body.name
  const filepath = req.file;
  // Save this data to a database probably
  //const response = await uploadUserImage(req, res);
  console.log(description, imageName, filepath)
  return res.json({description, imageName, filepath});
});

module.exports = router;