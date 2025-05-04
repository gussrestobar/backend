const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener menú por tenant
router.get('/:tenant_id', async (req, res) => {
  const { tenant_id } = req.params;
  const [rows] = await db.query(
    `SELECT m.*, c.nombre AS categoria 
     FROM menu_items m 
     LEFT JOIN categorias c ON m.categoria_id = c.id 
     WHERE m.tenant_id = ?`,
    [tenant_id]
  );
  res.send(rows);
});

// Agregar plato
router.post('/', async (req, res) => {
  const { nombre, descripcion, precio, imagen_url, categoria_id, tenant_id } = req.body;

  try {
    await db.query(
      `INSERT INTO menu_items 
        (nombre, descripcion, precio, imagen_url, categoria_id, tenant_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion, precio, imagen_url, categoria_id || null, tenant_id]
    );
    res.send({ msg: 'Plato guardado' });
  } catch (err) {
    console.error('Error al guardar plato:', err);
    res.status(500).send({ error: err.message });
  }
});

// Editar plato (por ID)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, imagen_url, categoria_id, tenant_id } = req.body;
  try {
    await db.query(
      `UPDATE menu_items 
       SET nombre = ?, descripcion = ?, precio = ?, imagen_url = ?, categoria_id = ?, tenant_id = ? 
       WHERE id = ?`,
      [nombre, descripcion, precio, imagen_url, categoria_id || null, tenant_id, id]
    );
    res.send({ msg: 'Plato actualizado' });
  } catch (err) {
    console.error('Error al actualizar plato:', err);
    res.status(500).send({ error: err.message });
  }
});

// Eliminar plato (por ID)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM menu_items WHERE id = ?', [id]);
    res.send({ msg: 'Plato eliminado' });
  } catch (err) {
    console.error('Error al eliminar plato:', err);
    res.status(500).send({ error: err.message });
  }
});

module.exports = router;
