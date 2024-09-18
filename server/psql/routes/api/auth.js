const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {validateToken} = require('../../middleware/auth');

const { getUser, login, createUserPin, getUserPin} = require('../../controllers/auth');
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


module.exports = router;
