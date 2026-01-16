const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    minlength: [2, 'El nom ha de tenir mínim 2 caràcters']
  },
  email: {
    type: String,
    required: [true, 'L\'email és obligatori'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Format d\'email no vàlid']
  },
  password: {
    type: String,
    required: [true, 'La contrasenya és obligatòria'],
    minlength: [6, 'La contrasenya ha de tenir mínim 6 caràcters'],
    select: false // No retornar la contrasenya per defecte en les consultes
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook: Xifrar la contrasenya abans de guardar
userSchema.pre('save', async function(next) {
  // Només xifrar si la contrasenya ha estat modificada
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generar salt amb cost factor de 10
    const salt = await bcrypt.genSalt(10);
    // Xifrar la contrasenya
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Mètode per comparar contrasenyes
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error al comparar contrasenyes');
  }
};

// Mètode toJSON: Eliminar la contrasenya quan es retorna l'usuari
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

// Actualitzar updatedAt abans de cada update
userSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('User', userSchema);