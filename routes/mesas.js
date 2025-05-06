const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener todas las mesas por tenant
router.get('/:tenant_id', async (req, res) => {
  const { tenant_id } = req.params;
  try {
    const [mesas] = await db.query(
      'SELECT * FROM mesas WHERE tenant_id = ?',
      [tenant_id]
    );
    res.json(mesas);
  } catch (err) {
    console.error('Error al obtener mesas:', err);
    res.status(500).send({ error: 'Error al obtener mesas' });
  }
});

// Obtener mesas disponibles (sin reserva) por tenant
router.get('/disponibles/:tenant_id', async (req, res) => {
  const { tenant_id } = req.params;
  try {
    const [mesas] = await db.query(
      `SELECT m.* FROM mesas m
       LEFT JOIN reservas r ON m.id = r.mesa_id AND r.fecha = CURDATE()
       WHERE m.tenant_id = ? AND m.estado = 'disponible' AND (r.id IS NULL OR r.estado = 'cancelada')`,
      [tenant_id]
    );
    res.json(mesas);
  } catch (err) {
    console.error('Error al obtener mesas disponibles:', err);
    res.status(500).send({ error: 'Error al obtener mesas disponibles' });
  }
});

// Crear mesa
router.post('/', async (req, res) => {
  const { numero, capacidad, tenant_id } = req.body;
  try {
    await db.query(
      'INSERT INTO mesas (numero, capacidad, estado, tenant_id) VALUES (?, ?, "disponible", ?)',
      [numero, capacidad, tenant_id]
    );
    res.send({ msg: 'Mesa creada' });
  } catch (err) {
    console.error('Error al crear mesa:', err);
    res.status(500).send({ error: 'Error al crear mesa' });
  }
});

// Actualizar mesa
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { numero, capacidad, estado, tenant_id } = req.body;
  try {
    await db.query(
      'UPDATE mesas SET numero = ?, capacidad = ?, estado = ?, tenant_id = ? WHERE id = ?',
      [numero, capacidad, estado || 'disponible', tenant_id, id]
    );
    res.send({ msg: 'Mesa actualizada' });
  } catch (err) {
    console.error('Error al actualizar mesa:', err);
    res.status(500).send({ error: 'Error al actualizar mesa' });
  }
});

// Eliminar mesa
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar si la mesa tiene reservas
    const [reservas] = await db.query(
      'SELECT COUNT(*) as count FROM reservas WHERE mesa_id = ?',
      [id]
    );

    if (reservas[0].count > 0) {
      return res.status(400).send({ error: 'No se puede eliminar una mesa con reservas activas' });
    }

    await db.query('DELETE FROM mesas WHERE id = ?', [id]);
    res.send({ msg: 'Mesa eliminada' });
  } catch (err) {
    console.error('Error al eliminar mesa:', err);
    res.status(500).send({ error: 'Error al eliminar mesa' });
  }
});

module.exports = router;
