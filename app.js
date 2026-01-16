const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar rutes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const taskRoutes = require('./routes/taskRoutes');
// const uploadRoutes = require('./routes/uploadRoutes'); // Si tens upload

const app = express();

// ===============================
// MIDDLEWARE GLOBALS
// ===============================

// Body parser
app.use(express.json());  // ← Aquesta és la línia correcta
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors());

// Servir fitxers estàtics (imatges, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===============================
// CONNEXIÓ A MONGODB
// ===============================

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connectat a MongoDB');
  })
  .catch((error) => {
    console.error('❌ Error connectant a MongoDB:', error.message);
    process.exit(1);
  });

// ===============================
// RUTES
// ===============================

// Ruta de benvinguda
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API del Gestor de Tasques amb Autenticació',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      tasks: '/api/tasks',
      admin: '/api/admin'
    }
  });
});

// Rutes d'autenticació (públiques)
app.use('/api/auth', authRoutes);

// Rutes de tasques (protegides)
app.use('/api/tasks', taskRoutes);

// Rutes d'administració (només admin)
app.use('/api/admin', adminRoutes);

// Rutes d'upload (si tens)
// app.use('/api/upload', uploadRoutes);

// ===============================
// MIDDLEWARE DE GESTIÓ D'ERRORS
// ===============================

// Ruta no trobada (404)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no trobada'
  });
});

// Gestió global d'errors
app.use((err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log de l'error al servidor (en desenvolupament)
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  // Errors de Mongoose - CastError (ID invàlid)
  if (err.name === 'CastError') {
    const message = 'Recurs no trobat';
    error = { message, statusCode: 404 };
  }

  // Errors de Mongoose - Validació
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, statusCode: 400 };
  }

  // Errors de Mongoose - Clau duplicada
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `El ${field} ja existeix`;
    error = { message, statusCode: 400 };
  }

  // Resposta d'error
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Error del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ===============================
// INICIAR SERVIDOR
// ===============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor executant-se al port ${PORT}`);
  console.log(`📍 Entorn: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;