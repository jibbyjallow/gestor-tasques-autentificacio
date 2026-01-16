const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

/**
 * Middleware per verificar que l'usuari està autenticat
 * Extreu el token del header Authorization i verifica que és vàlid
 */
const auth = async (req, res, next) => {
  let token;

  // 1. Extreure el token del header Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Verificar que el token existeix
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No autoritzat. Token no proporcionat'
    });
  }

  try {
    // 3. Verificar que el token és vàlid i decodificar-lo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Buscar l'usuari a la base de dades
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuari no trobat'
      });
    }

    // 5. Afegir l'usuari a req per utilitzar-lo als controladors
    req.user = user;

    // 6. Continuar amb el següent middleware o controlador
    next();
  } catch (error) {
    // Errors possibles: token invàlid, token expirat, etc.
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token invàlid'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirat'
      });
    }
    
    return res.status(401).json({
      success: false,
      error: 'Error d\'autenticació'
    });
  }
};

module.exports = auth;