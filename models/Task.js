const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El títol és obligatori'],
    trim: true,
    maxlength: [100, 'El títol no pot superar els 100 caràcters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripció no pot superar els 500 caràcters']
  },
  completed: {
    type: Boolean,
    default: false
  },
  cost: {
    type: Number,
    min: [0, 'El cost no pot ser negatiu'],
    default: 0
  },
  hours_estimated: {
    type: Number,
    min: [0, 'Les hores estimades no poden ser negatives'],
    default: 0
  },
  image: {
    type: String,
    default: 'default-task.jpg'
  },
  // CAMP NOU: Referència a l'usuari propietari
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'La tasca ha de pertànyer a un usuari'],
    index: true // Índex per millorar el rendiment
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

// Actualitzar updatedAt abans de cada update
taskSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();

});

// Índex compost per millorar cerques per usuari i estat
taskSchema.index({ user: 1, completed: 1 });

module.exports = mongoose.model('Task', taskSchema);