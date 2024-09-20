const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { createUser, createUserPin, getUserPin, updateProfile, updatePassword, verifyResetToken, verifyToken, sendResetEmailToken, sendVerification, resetPassword} = require('../../controllers/users');
const { validateToken } = require('../../middleware/auth');
//const { resetPassword } = require('../../models/users');


router.post(
  '/',
  [
   // check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters',
    ).isLength({ min: 6 }),
    check('role', 'User role is required').isString().not().isEmpty(),
  ],
  createUser,
);

router.post(
  '/profile',
  [
   // check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('name', 'User name is required').isString().not().isEmpty(),
  ],
  validateToken,
  updateProfile,
);

router.post(
  '/password',
  [
   // check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 12 or more characters',
      'Password must contain alphabets and numbers',
    ).isLength({ min: 12 }).isAlphanumeric(),
  ],
  validateToken,
  updatePassword,
);

router.post(
  '/forgot_password',
  [
   // check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
  ],
  sendResetEmailToken,
);

router.post(
  '/forgot_password/:token',
  [
   // check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 12 or more characters',
      'Password must contain alphabets and numbers',
    ).isLength({ min: 12 }).isAlphanumeric(),
    check('token', 'Reset token is required').isJWT().not().isEmpty(),
  ],
  verifyResetToken,
  resetPassword
);

router.post(
  '/verify',
  [
    check('token', 'token is required').isJWT().not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
  ],
  sendVerification,
);


router.get(
  '/verify/:token',
  [
    check('token', 'token is required').isJWT().not().isEmpty(),
  ],
  verifyToken,
);




module.exports = router;