const { body, validationResult } = require('express-validator');

/**
 * Middleware per validar el registre d'usuaris
 */
const registerValidation = [
  body('email')
    .notEmpty().withMessage('L\'email és obligatori')
    .isEmail().withMessage('Format d\'email no vàlid')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('La constrasenya és obligatòria')
    .isLength({ min: 6 }).withMessage('La contrasenya ha de tenir mínim 6 caràcters'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('El nom ha de tenir mínim 2 caràcters')
];

/**
 * Middleware per validar el login
 */
const loginValidation = [
  body('email')
    .notEmpty().withMessage('L\'email és obligatori')
    .isEmail().withMessage('Format d\'email no vàlid')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('La contrasenya és obligatòria')
];

/**
 * Middleware per validar el canvi de contrasenya
 */
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('La contrasenya actual és obligatòria'),
  
  body('newPassword')
    .notEmpty().withMessage('La nova contrasenya és obligatòria')
    .isLength({ min: 6 }).withMessage('La nova contrasenya ha de tenir mínim 6 caràcters')
];

/**
 * Middleware per validar l'actualització del perfil
 */
const updateProfileValidation = [
  body('email')
    .optional()
    .isEmail().withMessage('Format d\'email no vàlid')
    .normalizeEmail(),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('El nom ha de tenir mínim 2 caràcters')
];

/**
 * Middleware per comprovar els errors de validació
 */
const checkValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    
    return res.status(400).json({
      success: false,
      errors: formattedErrors
    });
  }
  
  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  updateProfileValidation,
  checkValidationErrors
};