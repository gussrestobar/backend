const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener estadísticas del dashboard
router.get('/estadisticas/:tenant_id', async (req, res) => {
  const { tenant_id } = req.params;
  console.log('Obteniendo estadísticas para tenant_id:', tenant_id);

  try {
    // Verificar la conexión a la base de datos
    const connection = await db.getConnection();
    console.log('Conexión a la base de datos establecida');

    try {
      // Obtener total de reservas (excluyendo canceladas)
      const [reservas] = await connection.query(`
        SELECT COUNT(*) as total_reservas 
        FROM reservas 
        WHERE tenant_id = ? 
          AND estado != 'cancelada'
      `, [tenant_id]);
      console.log('Resultado de reservas:', reservas);

      // Obtener total de mesas
      const [mesas] = await connection.query(`
        SELECT COUNT(*) as total_mesas 
        FROM mesas 
        WHERE tenant_id = ?
      `, [tenant_id]);
      console.log('Resultado de mesas:', mesas);

      // Obtener total de platos
      const [platos] = await connection.query(`
        SELECT COUNT(*) as total_platos 
        FROM platos 
        WHERE tenant_id = ?
      `, [tenant_id]);
      console.log('Resultado de platos:', platos);

      // Verificar que los resultados existan
      if (!reservas || !mesas || !platos) {
        throw new Error('Error al obtener los resultados de las consultas');
      }

      // Verificar que los resultados tengan la estructura esperada
      if (!reservas[0] || !mesas[0] || !platos[0]) {
        throw new Error('Los resultados no tienen la estructura esperada');
      }

      const response = {
        total_reservas: reservas[0].total_reservas || 0,
        total_mesas: mesas[0].total_mesas || 0,
        total_platos: platos[0].total_platos || 0
      };

      console.log('Respuesta final:', response);
      res.send(response);
    } finally {
      // Liberar la conexión
      connection.release();
    }
  } catch (err) {
    console.error('Error al obtener estadísticas:', err);
    res.status(500).send({ 
      error: 'Error al obtener estadísticas',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router; 