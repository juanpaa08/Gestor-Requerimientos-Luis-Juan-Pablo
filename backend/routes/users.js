// backend/routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendTempPasswordEmail } = require('../utils/email');
const authenticateToken = require('../middleware/auth'); // Importamos el middleware

module.exports = (connection) => {
  router.post('/register', async (req, res) => {
    const { username, password, role, currentRole } = req.body; // Añadimos currentRole para el rol del usuario autenticado
    console.log('Datos recibidos:', { username, password, role, currentRole }); // Log para depurar

    // Validación basada solo en el rol del usuario autenticado (currentRole)
    if (role === 'Admin' && currentRole !== 'Admin') {
      return res.status(403).json({ error: 'Solo los Admins pueden crear cuentas Admin' });
    }

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(username)) {
        return res.status(400).json({ error: 'Formato de email inválido' });
      }

      connection.query(
        'SELECT * FROM Usuarios WHERE username = ?',
        [username],
        async (err, results) => {
          if (err) {
            console.error('Error al consultar la base de datos:', err);
            return res.status(500).json({ error: 'Error al verificar usuario' });
          }
          if (results.length > 0) {
            return res.status(400).json({ error: 'El email ya está registrado' });
          }

          const tempPassword = Math.random().toString(36).slice(-8);
          const hashedPassword = await bcrypt.hash(tempPassword, 10);
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

          connection.query(
            'INSERT INTO Usuarios (username, password, role, temp_password_expires) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, role, expiresAt],
            async (err, results) => {
              if (err) {
                console.error('Error al insertar usuario:', err);
                return res.status(500).json({ error: 'Error al registrar usuario' });
              }

              try {
                await sendTempPasswordEmail(username, tempPassword);
              } catch (emailErr) {
                console.error('Error al enviar email:', emailErr);
                return res.status(500).json({ error: `Usuario registrado, pero falló el envío del email: ${emailErr.message}` });
              }

              res.json({ id: results.insertId, username, role });
            }
          );
        }
      );
    } catch (err) {
      console.error('Error general:', err);
      res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
  });

  // Ruta para listar usuarios (nueva)
  router.get('/list', authenticateToken, (req, res) => {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Solo los Admins pueden listar usuarios' });
    }
    connection.query('SELECT id_usuario, username, role FROM Usuarios', (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  });

  // Ruta para actualizar un usuario (nueva)
  router.put('/update/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Solo los Admins pueden editar usuarios' });
    }
    const { id } = req.params;
    const { username, role } = req.body;
    connection.query(
      'UPDATE Usuarios SET username = ?, role = ? WHERE id_usuario = ?',
      [username, role, id],
      (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.affectedRows === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json({ message: 'Usuario actualizado' });
      }
    );
  });

  // Ruta para eliminar un usuario (nueva)
  router.delete('/delete/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Solo los Admins pueden eliminar usuarios' });
    }
    const { id } = req.params;
    connection.query('DELETE FROM Usuarios WHERE id_usuario = ?', [id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.affectedRows === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json({ message: 'Usuario eliminado' });
    });
  });

  return router;
};