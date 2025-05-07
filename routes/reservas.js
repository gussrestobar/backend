const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { Reserva, ReservaMenu, Menu, Tenant } = require('../models/reserva');

// Obtener reservas por tenant
router.get('/:tenant_id', async (req, res) => {
  const { tenant_id } = req.params;
  const [rows] = await db.query('SELECT * FROM reservas WHERE tenant_id = ?', [tenant_id]);
  res.send(rows);
});

// Crear una nueva reserva
router.post('/', async (req, res) => {
  try {
    const { nombre, personas, fecha, hora, mesa, sucursal_id, pedido } = req.body;

    // Crear la reserva
    const reserva = await Reserva.create({
      nombre,
      personas,
      fecha,
      hora,
      mesa,
      tenant_id: sucursal_id,
      estado: 'pendiente'
    });

    // Agregar los items del pedido
    if (pedido && pedido.length > 0) {
      await Promise.all(pedido.map(async (item) => {
        await ReservaMenu.create({
          ReservaId: reserva.id,
          MenuId: item.menu_id,
          cantidad: item.cantidad,
          precio: item.precio
        });
      }));
    }

    // Obtener la reserva con sus relaciones
    const reservaCompleta = await Reserva.findByPk(reserva.id, {
      include: [
        {
          model: Menu,
          through: { attributes: ['cantidad', 'precio'] }
        },
        {
          model: Tenant,
          attributes: ['nombre']
        }
      ]
    });

    res.status(201).json(reservaCompleta);
  } catch (error) {
    console.error('Error al crear la reserva:', error);
    res.status(500).json({ error: 'Error al crear la reserva' });
  }
});

// Obtener todas las reservas
router.get('/', async (req, res) => {
  try {
    const reservas = await Reserva.findAll({
      include: [
        {
          model: Menu,
          through: { attributes: ['cantidad', 'precio'] }
        },
        {
          model: Tenant,
          attributes: ['nombre']
        }
      ],
      order: [['fecha', 'ASC'], ['hora', 'ASC']]
    });
    res.json(reservas);
  } catch (error) {
    console.error('Error al obtener las reservas:', error);
    res.status(500).json({ error: 'Error al obtener las reservas' });
  }
});

// Obtener reservas por sucursal
router.get('/sucursal/:tenantId', async (req, res) => {
  try {
    const reservas = await Reserva.findAll({
      where: { tenant_id: req.params.tenantId },
      include: [
        {
          model: Menu,
          through: { attributes: ['cantidad', 'precio'] }
        },
        {
          model: Tenant,
          attributes: ['nombre']
        }
      ],
      order: [['fecha', 'ASC'], ['hora', 'ASC']]
    });
    res.json(reservas);
  } catch (error) {
    console.error('Error al obtener las reservas de la sucursal:', error);
    res.status(500).json({ error: 'Error al obtener las reservas de la sucursal' });
  }
});

// Actualizar estado de la reserva
router.patch('/:id/estado', async (req, res) => {
  try {
    const { estado } = req.body;
    const reserva = await Reserva.findByPk(req.params.id);
    
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    await reserva.update({ estado });
    res.json(reserva);
  } catch (error) {
    console.error('Error al actualizar el estado de la reserva:', error);
    res.status(500).json({ error: 'Error al actualizar el estado de la reserva' });
  }
});

// Editar reserva
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { cliente_nombre, personas, fecha, hora, estado, tenant_id, mesa_id } = req.body;

  try {
    // Iniciar transacción
    await db.query('START TRANSACTION');

    // Obtener la mesa anterior
    const [reservaAnterior] = await db.query('SELECT mesa_id FROM reservas WHERE id = ?', [id]);
    const mesaAnteriorId = reservaAnterior[0]?.mesa_id;

    // Actualizar la reserva
    await db.query(
      'UPDATE reservas SET cliente_nombre = ?, personas = ?, fecha = ?, hora = ?, estado = ?, tenant_id = ?, mesa_id = ? WHERE id = ?',
      [cliente_nombre, personas, fecha, hora, estado || 'pendiente', tenant_id, mesa_id, id]
    );

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
    const [reserva] = await db.query('SELECT mesa_id FROM reservas WHERE id = ?', [id]);
    const mesaId = reserva[0]?.mesa_id;

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
