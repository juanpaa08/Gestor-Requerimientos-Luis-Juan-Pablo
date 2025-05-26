// backend/routes/requerimientos.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const authenticateToken = require('../middleware/auth'); // Middleware para verificar JWT

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'gestor_requerimientos'
});


// Obtener todos los requerimientos de un proyecto
router.get('/:idProyecto', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Requerimientos WHERE id_proyecto = ?',
      [req.params.idProyecto]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener requerimientos' });
  }
});

// Crear un requerimiento
router.post('/', authenticateToken, async (req, res) => {
  const { id_proyecto, titulo, descripcion, tipo, prioridad, estado, asignado_a } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO Requerimientos (id_proyecto, titulo, descripcion, tipo, prioridad, estado, asignado_a) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id_proyecto, titulo, descripcion, tipo, prioridad, estado, asignado_a || null]
    );
    res.json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear requerimiento' });
  }
});

// Actualizar un requerimiento
router.put('/:id', authenticateToken, async (req, res) => {
  const { titulo, descripcion, tipo, prioridad, estado, asignado_a } = req.body;
  try {
    await pool.query(
      'UPDATE Requerimientos SET titulo = ?, descripcion = ?, tipo = ?, prioridad = ?, estado = ?, asignado_a = ? WHERE id_requerimiento = ?',
      [titulo, descripcion, tipo, prioridad, estado, asignado_a || null, req.params.id]
    );
    res.json({ id: req.params.id, ...req.body });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar requerimiento' });
  }
});

// Eliminar un requerimiento
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM Requerimientos WHERE id_requerimiento = ?', [req.params.id]);
    res.json({ message: 'Requerimiento eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar requerimiento' });
  }
});

module.exports = (connection) => {
  router.get('/:idProyecto', (req, res) => {
    const { idProyecto } = req.params;
    connection.query(
      'SELECT * FROM Requerimientos WHERE id_proyecto = ?',
      [idProyecto],
      (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
      }
    );
  });

  // Otras rutas aquí...

  return router;
};