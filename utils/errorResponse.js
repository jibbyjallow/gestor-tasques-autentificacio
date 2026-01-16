/**
 * Classe personalitzada per a errors amb codi d'estat HTTP
 */
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    
    // Captura el stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorResponse;