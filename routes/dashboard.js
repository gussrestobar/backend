const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener estadísticas del dashboard
router.get('/estadisticas/:tenant_id', async (req, res) => {
  const { tenant_id } = req.params;

  try {
    // Obtener total de reservas (excluyendo canceladas)
    const [reservas] = await db.query(`
      SELECT COUNT(*) as total_reservas 
      FROM reservas 
      WHERE tenant_id = ? 
        AND estado != 'cancelada'
    `, [tenant_id]);

    // Obtener total de mesas
    const [mesas] = await db.query(`
      SELECT COUNT(*) as total_mesas 
      FROM mesas 
      WHERE tenant_id = ?
    `, [tenant_id]);

    // Obtener total de platos
    const [platos] = await db.query(`
      SELECT COUNT(*) as total_platos 
      FROM platos 
      WHERE tenant_id = ?
    `, [tenant_id]);

    console.log('Resultados de las consultas:', {
      reservas: reservas[0].total_reservas,
      mesas: mesas[0].total_mesas,
      platos: platos[0].total_platos
    });

    res.send({
      total_reservas: reservas[0].total_reservas,
      total_mesas: mesas[0].total_mesas,
      total_platos: platos[0].total_platos
    });
  } catch (err) {
    console.error('Error al obtener estadísticas:', err);
    res.status(500).send({ error: 'Error al obtener estadísticas' });
  }
});

module.exports = router; 