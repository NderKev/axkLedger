const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { createUser, updateUserPermission, createAdminUser } = require('../../controllers/users');
const { validateAdmin, validateToken } = require('../../middleware/auth');


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

router.post(
  '/admin',
  [
   // check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters',
    ).isLength({ min: 6 }),
    check('role', 'user role is required').not().isEmpty(),
  ],
  validateToken,
  validateAdmin,
  createAdminUser,
);

router.post(
  '/permission',
  [
    check('wallet_id', 'Wallet ID is required').not().isEmpty(),
    check('role_id', 'Please include a valid role').not().isEmpty(),
    check('user_role', 'User Role is required').not().isEmpty(),
  ],
  validateToken,
  validateAdmin,
  updateUserPermission,
);

module.exports = router;