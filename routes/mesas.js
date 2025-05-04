const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener mesas disponibles (sin reserva) por tenant
router.get('/disponibles/:tenant_id', async (req, res) => {
  const { tenant_id } = req.params;
  try {
    const [mesas] = await db.query(
      `SELECT m.* FROM mesas m
       LEFT JOIN reservas r ON m.id = r.mesa_id AND r.fecha = CURDATE()
       WHERE m.tenant_id = ? AND r.id IS NULL`,
      [tenant_id]
    );
    res.json(mesas);
  } catch (err) {
    console.error('Error al obtener mesas disponibles:', err);
    res.status(500).send({ error: 'Error al obtener mesas disponibles' });
  }
});

module.exports = router;
