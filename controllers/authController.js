const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Registrar un nou usuari
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 1. Comprovar si l'email ja existeix
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Aquest email ja està registrat'
      });
    }

    // 2. Crear nou usuari (la contrasenya es xifrarà automàticament pel pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role: 'user' // Per defecte
    });

    // 3. Generar token
    const token = generateToken(user);

    // 4. Retornar resposta
    res.status(201).json({
      success: true,
      message: 'Usuari registrat correctament',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Iniciar sessió
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Buscar usuari per email (incloent la contrasenya)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credencials incorrectes'
      });
    }

    // 2. Comparar contrasenya
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Credencials incorrectes'
      });
    }

    // 3. Generar token
    const token = generateToken(user);

    // 4. Retornar resposta (sense contrasenya)
    res.status(200).json({
      success: true,
      message: 'Sessió iniciada correctament',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtenir perfil de l'usuari actual
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    // req.user ja està disponible gràcies al middleware auth
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualitzar perfil d'usuari
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    
    // 1. Camps que es poden actualitzar
    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (email) fieldsToUpdate.email = email;

    // 2. Si s'actualitza l'email, verificar que no estigui en ús
    if (email && email !== req.user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          error: 'Aquest email ja està en ús'
        });
      }
    }

    // 3. Actualitzar usuari
    const user = await User.findByIdAndUpdate(
      req.user._id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Perfil actualitzat correctament',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Canviar contrasenya
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // 1. Obtenir usuari amb contrasenya
    const user = await User.findById(req.user._id).select('+password');

    // 2. Verificar contrasenya actual
    const isPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'La contrasenya actual no és correcta'
      });
    }

    // 3. Actualitzar contrasenya (es xifrarà automàticament pel pre-save hook)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Contrasenya canviada correctament'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
};