const User = require('../models/User');
const Task = require('../models/Task');

/**
 * @desc    Obtenir tots els usuaris del sistema
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtenir totes les tasques del sistema
 * @route   GET /api/admin/tasks
 * @access  Private/Admin
 */
const getAllTasks = async (req, res, next) => {
  try {
    // Populate per incloure informació de l'usuari propietari
    const tasks = await Task.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });

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
 * @desc    Eliminar un usuari i totes les seves tasques
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Verificar que l'admin no s'elimina a si mateix
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'No pots eliminar el teu propi compte'
      });
    }

    // 2. Buscar l'usuari
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuari no trobat'
      });
    }

    // 3. Eliminar totes les tasques de l'usuari
    await Task.deleteMany({ user: id });

    // 4. Eliminar l'usuari
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Usuari i les seves tasques eliminats correctament',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Canviar el rol d'un usuari
 * @route   PUT /api/admin/users/:id/role
 * @access  Private/Admin
 */
const changeUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // 1. Validar que el rol és vàlid
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Rol no vàlid. Ha de ser "user" o "admin"'
      });
    }

    // 2. Verificar que l'admin no es canvia el rol a si mateix
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'No pots canviar el teu propi rol'
      });
    }

    // 3. Buscar i actualitzar l'usuari
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuari no trobat'
      });
    }

    res.status(200).json({
      success: true,
      message: `Rol d'usuari canviat a "${role}" correctament`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getAllTasks,
  deleteUser,
  changeUserRole
};