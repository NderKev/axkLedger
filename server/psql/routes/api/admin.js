const express = require('express');
const router = express.Router();
const { check } = require('express-validator');;
const { validateAdmin, validateToken, validateFarmer } = require('../../middleware/auth');
const adminController = require('../../controllers/admin');
const {refreshToken} = require('../../controllers/auth');
const farmerController = require('../../controllers/farmers');


router.get('/', validateToken, validateAdmin, adminController.getAdmin);
router.get('/buyers', validateToken, validateAdmin, adminController.getBuyers);
router.get('/farmers', validateToken, validateAdmin, farmerController.getFarmers);
router.get('/permission', validateToken, validateAdmin, adminController.getUserPermission);
router.get('/permissions', validateToken, validateAdmin, adminController.getUserPermissions);
router.get('/pin', validateToken, validateAdmin, adminController.getAdminPin);
router.get('/roles', validateToken, validateAdmin, adminController.getUserRoles);


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
     // check('name', 'Name is required').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail(),
      check(
        'password',
        'Please enter a password with 12 or more characters',
        'Password must contain alphabets and numbers',
      ).isLength({ min: 12 }).isAlphanumeric(),
    ],
    validateToken,
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
    validateToken,
    validateAdmin,
    adminController.updateUserPermission,
  );

  router.post(
    '/role',
    [
      check('role', 'User Role is required').isString().exists(),
    ],
    validateToken,
    validateAdmin,
    adminController.createUserRole,
  );
  
  router.post(
    '/update/role',
    [
      check('role_id', 'User Role ID is required').isInt().exists(),
      check('role', 'User Role is required').isString().exists(),
    ],
    validateToken,
    validateAdmin,
    adminController.updateUserRole,
  );
  
  router.post(
    '/farmer/token',
    [
      check('token', 'farmer token is required').exists(),
      check('wallet_id', 'farmer wallet id is required').exists(),
      check('address', 'farmer address id is required').exists(),
    ],
    validateToken,
    validateAdmin,
    farmerController.createFarmerToken,
  );

  router.post(
    '/farmer/refresh',
    [
      check('x-farmer-token', 'farmer token is required').exists(),
      check('wallet_id', 'farmer wallet id is required').exists(),
      check('address', 'farmer address id is required').exists(),
    ],
    validateToken,
    validateAdmin,
    refreshToken,
  );

  router.post(
    '/pin',
    [
      check('pin', 'Pin is required').isNumeric().exists(),
    ],
    validateToken,
    validateAdmin,
    adminController.createAdminPin,
  );

  router.post(
    '/refresh',
    [
      check('pin', 'Pin is required').isNumeric().exists(),
    ],
    validateToken,
    validateAdmin,
    refreshToken,
  );



module.exports = router;
