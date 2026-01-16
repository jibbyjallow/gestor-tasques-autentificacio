const Task = require('../models/Task');

/**
 * @desc    Crear nova tasca
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = async (req, res, next) => {
  try {
    // Afegir automàticament l'usuari autenticat com a propietari
    req.body.user = req.user._id;

    const task = await Task.create(req.body);

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtenir totes les tasques de l'usuari autenticat
 * @route   GET /api/tasks
 * @access  Private
 */
const getAllTasks = async (req, res, next) => {
  try {
    // Filtrar només les tasques de l'usuari autenticat
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtenir una tasca per ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTaskById = async (req, res, next) => {
  try {
    // Buscar la tasca que pertanyi a l'usuari autenticat
    const task = await Task.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Tasca no trobada'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualitzar una tasca
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res, next) => {
  try {
    // No permetre modificar el propietari de la tasca
    delete req.body.user;

    // Buscar i actualitzar només si la tasca pertany a l'usuari
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Tasca no trobada'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Eliminar una tasca
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = async (req, res, next) => {
  try {
    // Buscar i eliminar només si la tasca pertany a l'usuari
    const task = await Task.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Tasca no trobada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tasca eliminada correctament',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtenir estadístiques de les tasques de l'usuari
 * @route   GET /api/tasks/stats
 * @access  Private
 */
const getTaskStats = async (req, res, next) => {
  try {
    // Filtrar només les tasques de l'usuari autenticat
    const stats = await Task.aggregate([
      // 1. Filtrar per usuari
      { $match: { user: req.user._id } },
      
      // 2. Agrupar i calcular estadístiques
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: ['$completed', 1, 0] }
          },
          pendingTasks: {
            $sum: { $cond: ['$completed', 0, 1] }
          },
          totalCost: { $sum: '$cost' },
          totalHours: { $sum: '$hours_estimated' },
          avgCost: { $avg: '$cost' },
          avgHours: { $avg: '$hours_estimated' }
        }
      }
    ]);

    // Si no hi ha tasques, retornar estadístiques buides
    if (stats.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
          totalCost: 0,
          totalHours: 0,
          avgCost: 0,
          avgHours: 0
        }
      });
    }

    // Formatar les dades
    const formattedStats = {
      totalTasks: stats[0].totalTasks,
      completedTasks: stats[0].completedTasks,
      pendingTasks: stats[0].pendingTasks,
      totalCost: Math.round(stats[0].totalCost * 100) / 100,
      totalHours: Math.round(stats[0].totalHours * 100) / 100,
      avgCost: Math.round(stats[0].avgCost * 100) / 100,
      avgHours: Math.round(stats[0].avgHours * 100) / 100,
      completionRate: Math.round((stats[0].completedTasks / stats[0].totalTasks) * 100)
    };

    res.status(200).json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualitzar imatge d'una tasca
 * @route   PUT /api/tasks/:id/image
 * @access  Private
 */
const updateTaskImage = async (req, res, next) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'Cal proporcionar una imatge'
      });
    }

    // Actualitzar només si la tasca pertany a l'usuari
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { image },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Tasca no trobada'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Restablir imatge per defecte
 * @route   PUT /api/tasks/:id/image/reset
 * @access  Private
 */
const resetTaskImage = async (req, res, next) => {
  try {
    // Actualitzar només si la tasca pertany a l'usuari
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { image: 'default-task.jpg' },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Tasca no trobada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Imatge restablerta per defecte',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
  updateTaskImage,
  resetTaskImage
};