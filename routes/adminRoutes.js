const express = require('express');
const router = express.Router();

// Controllers
const {
  getAllUsers,
  getAllTasks,
  deleteUser,
  changeUserRole
} = require('../controllers/adminController');

// Middleware
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Totes les rutes d'admin requereixen autenticació i rol d'admin
router.use(auth);
router.use(roleCheck(['admin']));

// Rutes
router.get('/users', getAllUsers);
router.get('/tasks', getAllTasks);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', changeUserRole);

module.exports = router;