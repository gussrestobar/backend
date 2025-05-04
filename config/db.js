const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'yamanote.proxy.rlwy.net',
  user: 'root',
  password: 'TbhyrVAQMBbZJjAKrWqbvBFVaVTiZvNm',
  database: 'railway',
  port: 31720
});

module.exports = db;
