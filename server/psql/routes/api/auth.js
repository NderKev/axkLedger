const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {validateToken, validateFarmer} = require('../../middleware/auth');
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
    check('pin', 'Pin is required').isNumeric().exists(),
  ],
  validateToken,
  authController.createUserPin,
);

router.put(
  '/pin',
  [
    check('passphrase', 'Pin is required').isNumeric().exists(),
    check('new_passphrase', 'Pin is required').isNumeric().exists(),
  ],
  validateToken,
  authController.updateUserPin,
);

router.post(
  '/key',
  [
    //check('pin', 'Please include a valid pin').isEmail(),
    check('key', 'Key is required').isNumeric().exists(),
  ],
  validateFarmer,
  createFarmerKey,
);

router.get(
  '/refresh',
  [
    check('x-auth-token', 'authetication token is required').isJWT().exists()
  ],
  authController.refreshToken,
);

router.post(
  '/permission',
  [
    check('wallet_id', 'Wallet ID is required').not().isEmpty(),
    check('role_id', 'Please include a valid role').isInt().not().isEmpty(),
    check('user_role', 'User Role is required').isString().not().isEmpty(),
  ],
  validateToken,
  authController.updateUserPermission,
);

module.exports = router;
