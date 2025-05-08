const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener reservas por tenant
router.get('/:tenant_id', async (req, res) => {
  const { tenant_id } = req.params;
  try {
    // Obtener las reservas
    const [reservas] = await db.query('SELECT * FROM reservas WHERE tenant_id = ?', [tenant_id]);
    
    // Para cada reserva, obtener sus platos
    for (let reserva of reservas) {
      const [platos] = await db.query(
        'SELECT * FROM reserva_platos WHERE reserva_id = ? AND tenant_id = ?',
        [reserva.id, tenant_id]
      );
      reserva.platos = platos;
    }
    
    res.send(reservas);
  } catch (err) {
    console.error('Error al obtener reservas:', err);
    res.status(500).send({ error: 'Error al obtener reservas' });
  }
});

// Crear reserva
router.post('/', async (req, res) => {
  const { cliente_nombre, personas, fecha, hora, estado, tenant_id, mesa_id, platos, total } = req.body;

  try {
    // Iniciar transacción
    await db.query('START TRANSACTION');

    // Insertar la reserva
    const [result] = await db.query(
      'INSERT INTO reservas (cliente_nombre, personas, fecha, hora, estado, tenant_id, mesa_id, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [cliente_nombre, personas, fecha, hora, estado || 'pendiente', tenant_id, mesa_id, total || 0]
    );

    const reservaId = result.insertId;

    // Insertar los platos si existen
    if (platos && platos.length > 0) {
      for (const plato of platos) {
        await db.query(
          'INSERT INTO reserva_platos (reserva_id, menu_item_id, nombre, precio, tenant_id) VALUES (?, ?, ?, ?, ?)',
          [reservaId, plato.id, plato.nombre, plato.precio, tenant_id]
        );
      }
    }

    // Actualizar el estado de la mesa
    await db.query(
      'UPDATE mesas SET estado = "ocupada" WHERE id = ?',
      [mesa_id]
    );

    // Confirmar transacción
    await db.query('COMMIT');

    res.send({ msg: 'Reserva registrada', id: reservaId });
  } catch (err) {
    // Revertir transacción en caso de error
    await db.query('ROLLBACK');
    console.error('Error al crear reserva:', err);
    res.status(500).send({ error: 'Error al crear reserva' });
  }
});

// Editar reserva
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { cliente_nombre, personas, fecha, hora, estado, tenant_id, mesa_id, platos, total } = req.body;

  try {
    // Iniciar transacción
    await db.query('START TRANSACTION');

    // Obtener la mesa anterior
    const [reservaAnterior] = await db.query('SELECT mesa_id FROM reservas WHERE id = ?', [id]);
    const mesaAnteriorId = reservaAnterior[0]?.mesa_id;

    // Actualizar la reserva
    await db.query(
      'UPDATE reservas SET cliente_nombre = ?, personas = ?, fecha = ?, hora = ?, estado = ?, tenant_id = ?, mesa_id = ?, total = ? WHERE id = ?',
      [cliente_nombre, personas, fecha, hora, estado || 'pendiente', tenant_id, mesa_id, total || 0, id]
    );

    // Eliminar platos anteriores
    await db.query('DELETE FROM reserva_platos WHERE reserva_id = ? AND tenant_id = ?', [id, tenant_id]);

    // Insertar los nuevos platos si existen
    if (platos && platos.length > 0) {
      for (const plato of platos) {
        await db.query(
          'INSERT INTO reserva_platos (reserva_id, menu_item_id, nombre, precio, tenant_id) VALUES (?, ?, ?, ?, ?)',
          [id, plato.id, plato.nombre, plato.precio, tenant_id]
        );
      }
    }

    // Liberar la mesa anterior si existe
    if (mesaAnteriorId) {
      await db.query('UPDATE mesas SET estado = "disponible" WHERE id = ?', [mesaAnteriorId]);
    }

    // Actualizar el estado de la nueva mesa
    await db.query('UPDATE mesas SET estado = "ocupada" WHERE id = ?', [mesa_id]);

    // Confirmar transacción
    await db.query('COMMIT');

    res.send({ msg: 'Reserva actualizada' });
  } catch (err) {
    // Revertir transacción en caso de error
    await db.query('ROLLBACK');
    console.error('Error al actualizar reserva:', err);
    res.status(500).send({ error: 'Error al actualizar reserva' });
  }
});

// Eliminar reserva
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Iniciar transacción
    await db.query('START TRANSACTION');

    // Obtener la mesa de la reserva
    const [reserva] = await db.query('SELECT mesa_id, tenant_id FROM reservas WHERE id = ?', [id]);
    const mesaId = reserva[0]?.mesa_id;
    const tenantId = reserva[0]?.tenant_id;

    // Eliminar los platos de la reserva
    await db.query('DELETE FROM reserva_platos WHERE reserva_id = ? AND tenant_id = ?', [id, tenantId]);

    // Eliminar la reserva
    await db.query('DELETE FROM reservas WHERE id = ?', [id]);

    // Liberar la mesa si existe
    if (mesaId) {
      await db.query('UPDATE mesas SET estado = "disponible" WHERE id = ?', [mesaId]);
    }

    // Confirmar transacción
    await db.query('COMMIT');

    res.send({ msg: 'Reserva eliminada' });
  } catch (err) {
    // Revertir transacción en caso de error
    await db.query('ROLLBACK');
    console.error('Error al eliminar reserva:', err);
    res.status(500).send({ error: 'Error al eliminar reserva' });
  }
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
