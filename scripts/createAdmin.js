const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

/**
 * Script per crear un usuari administrador
 * Ús: node scripts/createAdmin.js
 */

const createAdmin = async () => {
  try {
    // Connectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connectat a MongoDB');

    // Dades de l'admin
    const adminData = {
      name: 'Administrador',
      email: 'admin@example.com',
      password: 'admin123456',
      role: 'admin'
    };

    // Comprovar si ja existeix
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('⚠️  Aquest email ja està registrat');
      
      // Opció: actualitzar a admin si no ho és
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Usuari actualitzat a rol admin');
      }
    } else {
      // Crear nou admin
      const admin = await User.create(adminData);
      console.log('✅ Admin creat correctament:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: ${adminData.password}`);
      console.log(`   Rol: ${admin.role}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();