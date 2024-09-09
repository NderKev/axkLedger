const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {validateToken} = require('../../middleware/auth');

const { getUser, login} = require('../../controllers/auth');
//const { createUserRole } = require('../../models/users');

router.get('/', validateToken, getUser);

router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  login,
);



module.exports = router;
