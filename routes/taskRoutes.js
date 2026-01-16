const express = require('express');
const router = express.Router();

// Controllers
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
  updateTaskImage,
  resetTaskImage
} = require('../controllers/taskController');

// Middleware
const auth = require('../middleware/auth');

// Aplicar autenticació a TOTES les rutes
router.use(auth);

// Rutes de tasques (totes protegides)
// IMPORTANT: /stats ha d'anar abans de /:id per evitar conflictes
router.get('/stats', getTaskStats);
router.post('/', createTask);
router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.put('/:id/image', updateTaskImage);
router.put('/:id/image/reset', resetTaskImage);

module.exports = router;