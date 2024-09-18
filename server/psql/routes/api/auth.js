const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {validateToken, validateFarmerExists} = require('../../middleware/auth');
const {createFarmerKey} = require('../../controllers/farmers');
const { getUser, login, createUserPin, getUserPin, refreshToken} = require('../../controllers/auth');
//const { createUserRole } = require('../../models/users');

router.get('/', validateToken, getUser);
router.get('/pin', validateToken, getUserPin);

router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  login,
);

router.post(
  '/pin',
  [
    //check('pin', 'Please include a valid pin').isEmail(),
    check('pin', 'Pin is required').isNumeric().exists(),
  ],
  validateToken,
  createUserPin,
);

router.post(
  '/key',
  [
    //check('pin', 'Please include a valid pin').isEmail(),
    check('key', 'Key is required').isNumeric().exists(),
  ],
  validateFarmerExists,
  createFarmerKey,
);

router.post(
  '/refresh',
  [
    //check('pin', 'Please include a valid pin').isEmail(),
    check('passphrase', 'Passphrase is required').isNumeric().exists(),
  ],
  validateToken,
  refreshToken,
);

module.exports = router;
