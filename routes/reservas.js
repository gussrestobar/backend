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

// Obtener resumen de reservas por tenant
router.get('/resumen/:tenant_id', async (req, res) => {
  const { tenant_id } = req.params;
  try {
    // Obtener total de reservas para hoy
    const [reservasHoy] = await db.query(
      'SELECT COUNT(*) as total FROM reservas WHERE tenant_id = ? AND fecha = CURDATE()',
      [tenant_id]
    );

    // Obtener total de mesas disponibles
    const [mesasDisponibles] = await db.query(
      `SELECT COUNT(*) as total FROM mesas m
       LEFT JOIN reservas r ON m.id = r.mesa_id AND r.fecha = CURDATE()
       WHERE m.tenant_id = ? AND r.id IS NULL`,
      [tenant_id]
    );

    // Obtener total de reservas del mes
    const [reservasMes] = await db.query(
      'SELECT COUNT(*) as total FROM reservas WHERE tenant_id = ? AND MONTH(fecha) = MONTH(CURDATE())',
      [tenant_id]
    );

    res.json({
      reservas: reservasHoy[0].total,
      mesas: mesasDisponibles[0].total,
      total: reservasMes[0].total
    });
  } catch (err) {
    console.error('Error al obtener resumen:', err);
    res.status(500).send({ error: 'Error al obtener resumen' });
  }
});

module.exports = router;
