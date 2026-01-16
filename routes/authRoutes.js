const express = require('express');
const router = express.Router();

// Controllers
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
} = require('../controllers/authController');

// Middleware
const auth = require('../middleware/auth');
const {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  updateProfileValidation,
  checkValidationErrors
} = require('../middleware/validators/authValidators');

// Rutes públiques
router.post('/register', registerValidation, checkValidationErrors, register);
router.post('/login', loginValidation, checkValidationErrors, login);

// Rutes protegides (requereixen autenticació)
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfileValidation, checkValidationErrors, updateProfile);
router.put('/change-password', auth, changePasswordValidation, checkValidationErrors, changePassword);

module.exports = router;