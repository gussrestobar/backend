const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root', // sin contraseña
  database: 'chatbot_reservas',
});

module.exports = db;
