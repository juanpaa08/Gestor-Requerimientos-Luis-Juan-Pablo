const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const authenticateToken = require('../middleware/auth');
const { sendEmail } = require('../utils/email'); // Cambiamos a sendEmail

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'gestor_requerimientos'
});

// Obtener todas las tareas de un proyecto
router.get('/:id_proyecto', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Tareas WHERE id_proyecto = ?',
      [req.params.id_proyecto]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
});

// Crear una tarea
router.post('/', authenticateToken, async (req, res) => {
  const { id_proyecto, descripcion, prioridad, estado, fecha_limite, asignado_a } = req.body;
  try {
    console.log('Datos recibidos para crear tarea:', req.body); // Depuración
    const [result] = await pool.query(
      'INSERT INTO Tareas (id_proyecto, descripcion, prioridad, estado, fecha_limite, asignado_a) VALUES (?, ?, ?, ?, ?, ?)',
      [id_proyecto, descripcion, prioridad, estado, fecha_limite, asignado_a || null]
    );
    const taskId = result.insertId;

    // Enviar correo al usuario asignado (si existe)
    if (asignado_a) {
      console.log('Buscando usuario con id:', asignado_a); // Depuración
      const [user] = await pool.query(
        'SELECT username FROM Usuarios WHERE id_usuario = ?',
        [asignado_a]
      );
      if (user.length > 0) {
        const email = user[0].username;
        const emailContent = `
          Nueva tarea asignada:
          - Proyecto: ${id_proyecto}
          - Descripción: ${descripcion}
          - Prioridad: ${prioridad}
          - Fecha límite: ${fecha_limite}
        `;
        console.log('Enviando correo a:', email); // Depuración
        await sendEmail(email, 'Nueva Tarea Asignada', emailContent); // Usamos sendEmail
      } else {
        console.log('Usuario no encontrado para id:', asignado_a); // Depuración
      }
    }

    res.status(201).json({ id: taskId, ...req.body });
  } catch (err) {
    console.error('Error al crear tarea:', err.message); // Log detallado
    console.error('Stack trace:', err.stack); // Más detalles
    res.status(500).json({ error: `Error al crear tarea: ${err.message}` });
  }
});

// Actualizar una tarea
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { descripcion, prioridad, estado, fecha_limite, asignado_a } = req.body;
  try {
    await pool.query(
      'UPDATE Tareas SET descripcion = ?, prioridad = ?, estado = ?, fecha_limite = ?, asignado_a = ? WHERE id_tarea = ?',
      [descripcion, prioridad, estado, fecha_limite, asignado_a || null, id]
    );
    res.json({ id, ...req.body });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar tarea' });
  }
});

// Eliminar una tarea
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM Tareas WHERE id_tarea = ?', [req.params.id]);
    res.json({ message: 'Tarea eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar tarea' });
  }
});

module.exports = (connection) => {
  return router;
};