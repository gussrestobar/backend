// routes/example.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

console.log("✅ exampleRoutes cargado");

// Ruta de prueba: conexión con base de datos
router.get('/test-db', (req, res) => {
  db.query('SELECT NOW() as fecha_actual', (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la consulta' });
    }
    res.json({ resultado: result[0] });
  });
});

// Obtener sucursales (tenants)
router.get('/tenants', (req, res) => {
  db.query('SELECT id, nombre FROM tenants', (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al obtener sucursales' });
    res.json(result);
  });
});

// Registro de usuario
router.post('/register', async (req, res) => {
  const { email, password, rol, tenant_id } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = 'INSERT INTO usuarios (email, password, rol, tenant_id) VALUES (?, ?, ?, ?)';
  db.query(query, [email, hashedPassword, rol, tenant_id], (err, result) => {
    if (err) {
      console.error('Error al registrar usuario:', err);
      return res.status(500).json({ error: 'No se pudo registrar el usuario' });
    }
    res.json({ message: 'Usuario registrado correctamente' });
  });
});

// Login de usuario
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM usuarios WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos' });
    if (results.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });

    const user = results[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Contraseña incorrecta' });

    // Crear token si lo deseas, opcional
    const token = jwt.sign({ id: user.id, email: user.email }, 'secreto', { expiresIn: '1d' });

    res.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        email: user.email,
        rol: user.rol,
        tenant_id: user.tenant_id
      },
      token
    });
  });
});

module.exports = router;
