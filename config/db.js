const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST || 'yamanote.proxy.rlwy.net',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'TbhyrVAQMBbZJjAKrWqbvBFVaVTiZvNm',
  database: process.env.DB_NAME || 'chatbot_reservas',
  port: process.env.DB_PORT || 31720
});

// Verificar la conexión
db.getConnection()
  .then(connection => {
    console.log('✅ Conectado a la base de datos MySQL con éxito');
    console.log(`Base de datos: ${process.env.DB_NAME || 'chatbot_reservas'}`);
    connection.release();
  })
  .catch(err => {
    console.error('❌ Error al conectar a la base de datos:', err);
  });

module.exports = db;
