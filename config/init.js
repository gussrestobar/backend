const sequelize = require('./database');
const { Reserva, ReservaMenu } = require('../models/reserva');

async function initDatabase() {
  try {
    // Sincronizar todos los modelos
    await sequelize.sync({ alter: true });
    console.log('Base de datos sincronizada correctamente');
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error);
  }
}

module.exports = initDatabase; 