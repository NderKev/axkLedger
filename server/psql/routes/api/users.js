const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { createUser } = require('../../controllers/users');
//const { validateAdmin, validateToken } = require('../../middleware/auth');


router.post(
  '/',
  [
   // check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters',
    ).isLength({ min: 6 }),
    check('role', 'User role is required').not().isEmpty(),
  ],
  createUser,
);



module.exports = router;