// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = (connection) => {
  router.post('/login', async (req, res) => {
    const { username, password, role } = req.body;

    try {
      // 1. Buscar el usuario FILTRANDO por username Y rol
      connection.query(
        'SELECT * FROM Usuarios WHERE username = ? AND role = ?', // ← Cambio clave aquí
        [username, role], // ← Enviamos ambos parámetros
        async (err, results) => {
          if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).json({ error: 'Error en el servidor' });
          }

          // 2. Validar si el usuario existe
          if (results.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado o rol incorrecto' }); // ← Mensaje más preciso
          }

          const user = results[0];

          // 3. Verificar contraseña temporal (si aplica)
          if (user.temp_password_expires && new Date() > new Date(user.temp_password_expires)) {
            return res.status(401).json({ error: 'Contraseña temporal expirada' });
          }

          // 4. Comparar contraseñas
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return res.status(401).json({ error: 'Contraseña incorrecta' }); // ← Mensaje específico
          }

          // 5. Generar token (el rol ya viene validado desde la consulta SQL)
          const token = jwt.sign(
            { 
              id: user.id_usuario, 
              role: user.role // ← Usamos el rol de la BD, no el del request
            },
            process.env.JWT_SECRET || 'tu_secreto_seguro',
            { expiresIn: '1h' }
          );

          // 6. Respuesta exitosa
          res.json({ 
            username: user.username, 
            role: user.role, // ← Rol real desde BD
            token 
          });
        }
      );
    } catch (err) {
      console.error('Error general en login:', err);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  });

  return router;
};