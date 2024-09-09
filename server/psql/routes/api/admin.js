const express = require('express');
const router = express.Router();
const { check } = require('express-validator');;
const { validateAdmin, validateToken } = require('../../middleware/auth');
const { updateUserPermission, createAdminUser, getUserPermission, getUserPermissions, getUserRoles, getBuyers, createUserRole, updateUserRole } = require('../../controllers/admin');
const { getUser, login} = require('../../controllers/auth');
const farmerController = require('../../controllers/farmers');


router.get('/', validateToken, validateAdmin, getUser);
router.get('/buyers', validateToken, validateAdmin, getBuyers);
router.get('/farmers', validateToken, validateAdmin, farmerController.getFarmers);
router.get('/permission', validateToken, validateAdmin, getUserPermission);
router.get('/permissions', validateToken, validateAdmin, getUserPermissions);
router.get('/roles', validateToken, validateAdmin, getUserRoles);


router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  login,
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

  router.post(
    '/role',
    [
      //check('role', 'Please include a valid role').isEmail(),
      check('role', 'User Role is required').exists(),
    ],
    validateToken,
    validateAdmin,
    createUserRole,
  );
  
  router.post(
    '/update/role',
    [
      check('role_id', 'User Role ID is required').exists(),
      check('role', 'User Role is required').exists(),
    ],
    validateToken,
    validateAdmin,
    updateUserRole,
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



module.exports = router;
