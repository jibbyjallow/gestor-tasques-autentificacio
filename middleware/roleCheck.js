/**
 * Middleware per verificar que l'usuari té el rol adequat
 * S'utilitza després del middleware auth
 * @param {Array} roles - Array amb els rols permesos ['admin', 'user']
 */
const roleCheck = (roles) => {
  return (req, res, next) => {
    // 1. Verificar que l'usuari existeix (hauria d'estar afegit pel middleware auth)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'No autoritzat'
      });
    }

    // 2. Verificar que el rol de l'usuari està a la llista de rols permesos
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'No tens permisos per accedir a aquest recurs'
      });
    }

    // 3. L'usuari té el rol adequat, continuar
    next();
  };
};

module.exports = roleCheck;