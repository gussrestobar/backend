const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST || 'yamanote.proxy.rlwy.net',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'TbhyrVAQMBbZJjAKrWqbvBFVaVTiZvNm',
  database: process.env.DB_NAME || 'railway',
  port: process.env.DB_PORT || 31720
});

module.exports = db;
