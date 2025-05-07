const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Tenant = require('./tenant');
const Menu = require('./menu');

const Reserva = sequelize.define('Reserva', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  personas: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false
  },
  hora: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mesa: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'confirmada', 'cancelada'),
    defaultValue: 'pendiente'
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Tenant,
      key: 'id'
    }
  }
});

// Relación con Tenant
Reserva.belongsTo(Tenant, { foreignKey: 'tenant_id' });

// Tabla de relación para los items del pedido
const ReservaMenu = sequelize.define('ReservaMenu', {
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
});

// Relaciones muchos a muchos entre Reserva y Menu
Reserva.belongsToMany(Menu, { through: ReservaMenu });
Menu.belongsToMany(Reserva, { through: ReservaMenu });

module.exports = { Reserva, ReservaMenu }; 