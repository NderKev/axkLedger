const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {validateToken, validateAdmin} = require('../../middleware/auth');

const { getUser, login, getUserPermission, getUserPermissions, getUserRoles, createUserRole, updateUserRole } = require('../../controllers/auth');
//const { createUserRole } = require('../../models/users');

router.get('/', validateToken, getUser);
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

module.exports = router;
