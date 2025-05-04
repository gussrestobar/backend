const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener reservas por tenant
router.get('/:tenant_id', async (req, res) => {
  const { tenant_id } = req.params;
  const [rows] = await db.query('SELECT * FROM reservas WHERE tenant_id = ?', [tenant_id]);
  res.send(rows);
});

// Crear reserva
router.post('/', async (req, res) => {
  const { cliente_nombre, personas, fecha, hora, estado, tenant_id } = req.body;

  await db.query(
    'INSERT INTO reservas (cliente_nombre, personas, fecha, hora, estado, tenant_id) VALUES (?, ?, ?, ?, ?, ?)',
    [cliente_nombre, personas, fecha, hora, estado || 'pendiente', tenant_id]
  );

  res.send({ msg: 'Reserva registrada' });
});

// Editar reserva
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { cliente_nombre, personas, fecha, hora, estado, tenant_id } = req.body;

  await db.query(
    'UPDATE reservas SET cliente_nombre = ?, personas = ?, fecha = ?, hora = ?, estado = ?, tenant_id = ? WHERE id = ?',
    [cliente_nombre, personas, fecha, hora, estado || 'pendiente', tenant_id, id]
  );

  res.send({ msg: 'Reserva actualizada' });
});

// Eliminar reserva
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await db.query('DELETE FROM reservas WHERE id = ?', [id]);
  res.send({ msg: 'Reserva eliminada' });
});

module.exports = router;
