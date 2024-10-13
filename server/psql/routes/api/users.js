const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const userController = require('../../controllers/users');
const { validateToken } = require('../../middleware/auth');

router.get('/profile', validateToken, userController.getUserProfile);
router.get('/tx/all', validateToken, userController.getUserTransactions);
router.get('/tx/complete', validateToken, userController.getUserCompleteTransactions);
router.get('/tx/pending', validateToken, userController.getUserPendingTransactions);

router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 8 or more characters',
    ).isLength({ min: 8 }),
  ],
  userController.createUser,
);

router.post(
  '/profile',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('name', 'User name is required').isString().not().isEmpty(),
  ],
  validateToken,
  userController.updateProfile,
);

router.post(
  '/password',
  [
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 12 or more characters',
      'Password must contain alphabets and numbers',
    ).isLength({ min: 12 }).isAlphanumeric(),
  ],
  validateToken,
  userController.updatePassword,
);

router.post(
  '/change',
  [
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 8 or more characters',
    ).isLength({ min: 8 }),
    check(
      'new_password',
      'Please enter a password with 12 or more characters',
      'Password must contain alphabets and numbers',
    ).isLength({ min: 12 }).isAlphanumeric(),
  ],
  validateToken,
  userController.changePassword,
);

router.post(
  '/forgot_password',
  [
    check('email', 'Please include a valid email').isEmail(),
  ],
  userController.sendResetEmailToken,
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
  userController.verifyResetToken,
  userController.resetPassword
);

router.post(
  '/verify',
  [
    check('token', 'token is required').isJWT().not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
  ],
  userController.sendVerification,
);

router.get(
  '/otp/:otp',
  [
    check('otp', 'otp is required').isNumeric().not().isEmpty()
  ],
  userController.verifyOTP,
);

router.get(
  '/verify',
  [
    check('x-auth-token', 'token is required').isJWT().not().isEmpty()
  ],
  validateToken,
  userController.createEmailToken,
);

router.get(
  '/verify/:token',
  [
    check('token', 'token is required').isJWT().not().isEmpty(),
  ],
  userController.verifyToken,
);


router.get(
  '/tx',
  [
    check('hash', 'transaction hash is required').isHexadecimal().not().isEmpty(),
  ],
  validateToken,
  userController.getUserTransactionDetails,
);




module.exports = router;