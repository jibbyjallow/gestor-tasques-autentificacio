const jwt = require('jsonwebtoken');

/**
 * Genera un token JWT per a un usuari
 * @param {Object} user - Objecte usuari de Mongoose
 * @returns {String} Token JWT generat
 */
const generateToken = (user) => {
  // Payload del token: informació que volem incloure
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role
  };

  // Opcions del token
  const options = {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  };

  // Generar i retornar el token
  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

module.exports = generateToken;