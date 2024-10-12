const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { validateAdmin, validateFarmer } = require('../../middleware/auth');
const adminController = require('../../controllers/admin');
const {refreshToken} = require('../../controllers/auth');
const farmerController = require('../../controllers/farmers');
const transactions = require('../../controllers/transactions');


router.get('/', validateAdmin, adminController.getAdmin);
router.get('/buyers',  validateAdmin, adminController.getBuyers);
router.get('/farmers',  validateAdmin, farmerController.getFarmers);
router.get('/permission',  validateAdmin, adminController.getUserPermission);
router.get('/permissions',  validateAdmin, adminController.getUserPermissions);
router.get('/pin',  validateAdmin, adminController.getAdminPin);
router.get('/roles',  validateAdmin, adminController.getUserRoles);
router.get('/txs',  validateAdmin, transactions.getAllTransactions);


router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  adminController.login,
);

router.post(
    '/admin',
    [
      check('email', 'Please include a valid email').isEmail(),
      check(
        'password',
        'Please enter a password with 12 or more characters',
        'Password must contain alphabets and numbers',
      ).isLength({ min: 12 }).isAlphanumeric(),
    ],
    validateAdmin,
    adminController.createAdminUser,
  );
  
  router.post(
    '/permission',
    [
      check('wallet_id', 'Wallet ID is required').not().isEmpty(),
      check('role_id', 'Please include a valid role').isInt().not().isEmpty(),
      check('user_role', 'User Role is required').not().isEmpty(),
    ],   
    validateAdmin,
    adminController.updateUserPermission,
  );

  router.post(
    '/role',
    [
      check('role', 'User Role is required').isString().exists(),
    ],    
    validateAdmin,
    adminController.createUserRole,
  );
  
  router.post(
    '/update/role',
    [
      check('role_id', 'User Role ID is required').isInt().exists(),
      check('role', 'User Role is required').isString().exists(),
    ],   
    validateAdmin,
    adminController.updateUserRole,
  );
  
  router.post(
    '/farmer/token',
    [
      check('x-admin-token', 'admin token is required').isJWT().exists(),
      check('address', 'farmer address id is required').isEthereumAddress().exists(),
    ],
    validateAdmin,
    farmerController.updateFarmerToken,
  );

  router.post(
    '/farmer/refresh',
    [
      check('x-farmer-token', 'farmer token is required').exists(),
      check('wallet_id', 'farmer wallet id is required').exists(),
      check('address', 'farmer address id is required').exists(),
    ],   
    validateAdmin,
    validateFarmer,
    refreshToken,
  );

  router.post(
    '/pin',
    [
      check('pin', 'Pin is required').isNumeric().exists(),
    ],   
    validateAdmin,
    adminController.createAdminPin,
  );

  router.get(
    '/refresh',
    [
      check('x-admin-token', 'authetication token is required').isJWT().exists()
    ],
    refreshToken,
  );

  router.post(
    '/del/user',
    [
      check('email', 'email is required').isEmail().exists(),
    ],   
    validateAdmin,
    adminController.deleteUser,
  );


module.exports = router;
