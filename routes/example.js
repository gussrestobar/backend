console.log("✅ exampleRoutes cargado");
// routes/example.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Ruta de prueba
router.get('/test-db', (req, res) => {
  db.query('SELECT NOW() as fecha_actual', (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la consulta' });
    }
    res.json({ resultado: result[0] });
  });
});

module.exports = router;
