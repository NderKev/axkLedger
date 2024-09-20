const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {validateToken, validateFarmerExists} = require('../../middleware/auth');
const {createFarmerKey} = require('../../controllers/farmers');
const authController = require('../../controllers/auth');
//const { createUserRole } = require('../../models/users');

router.get('/', validateToken, authController.getUser);
router.get('/pin', validateToken, authController.getUserPin);

router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  authController.login,
);

router.post(
  '/pin',
  [
    //check('pin', 'Please include a valid pin').isEmail(),
    check('pin', 'Pin is required').isNumeric().exists(),
  ],
  validateToken,
  authController.createUserPin,
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
  authController.refreshToken,
);

router.post(
  '/permission',
  [
    check('wallet_id', 'Wallet ID is required').not().isEmpty(),
    check('role_id', 'Please include a valid role').isInt().not().isEmpty(),
    check('user_role', 'User Role is required').not().isEmpty(),
  ],
  validateToken,
  authController.updateUserPermission,
);

module.exports = router;
