const express = require('express');
const cors = require('cors'); 
const logger = require('./middleware/logger');
const cookieParser = require('cookie-parser');
const path = require('path');
const fileupload = require('express-fileupload');

 const app = express();

  app.use(express.json());
  app.use(cors());
  app.use(fileupload());//{safeFileNames: true}
  app.use(express.urlencoded({extended: true})); 
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '/public')));
  app.use(function(req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
  });
  app.use(cookieParser());
  app.use(logger)


module.exports = app;