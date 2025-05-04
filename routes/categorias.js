const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM categorias');
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { nombre } = req.body;
  await db.query('INSERT INTO categorias (nombre) VALUES (?)', [nombre]);
  res.send({ msg: 'Categoría creada' });
});

module.exports = router;
