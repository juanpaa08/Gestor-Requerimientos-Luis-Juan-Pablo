const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendTempPasswordEmail } = require('../utils/email.js');
const crypto = require('crypto');

module.exports = (connection) => {
  router.post('/login', async (req, res) => {
    const { username, password, role } = req.body;

    try {
      console.log('Procesando login para:', username, 'con rol:', role); // Depuración inicial
      // 1. Buscar el usuario FILTRANDO por username Y rol
      connection.query(
        'SELECT * FROM Usuarios WHERE username = ? AND role = ?',
        [username, role],
        async (err, results) => {
          if (err) {
            console.error('Error en la consulta SQL:', err);
            return res.status(500).json({ error: 'Error en el servidor al consultar usuario' });
          }

          console.log('Resultado de la consulta:', results); // Depuración
          // 2. Validar si el usuario existe
          if (results.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado o rol incorrecto' });
          }

          const user = results[0];
          console.log('Usuario encontrado:', user); // Depuración

          // 3. Verificar contraseña temporal (si aplica)
          if (user.temp_password_expires && new Date() > new Date(user.temp_password_expires)) {
            console.log('Contraseña temporal expirada para:', user.username); // Depuración
            try {
              // Generar una nueva contraseña temporal aleatoria
              const tempPassword = generateTempPassword();
              const hashedTempPassword = await bcrypt.hash(tempPassword, 10);
              const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas más

              console.log('Nueva contraseña generada:', tempPassword); // Depuración
              console.log('Nueva fecha de expiración:', newExpiresAt); // Depuración

              // Actualizar la contraseña temporal y la fecha de expiración en la base de datos
              await new Promise((resolve, reject) => {
                connection.query(
                  'UPDATE Usuarios SET password = ?, temp_password_expires = ? WHERE id_usuario = ?',
                  [hashedTempPassword, newExpiresAt, user.id_usuario],
                  (err, result) => {
                    if (err) {
                      console.error('Error al actualizar la contraseña temporal:', err);
                      reject(new Error('Error al actualizar la contraseña en la base de datos: ' + err.message));
                    } else {
                      console.log('Contraseña y fecha actualizadas en la base de datos:', result); // Depuración
                      resolve();
                    }
                  }
                );
              });

              // Enviar la nueva contraseña temporal por email
              console.log('Intentando enviar email a:', user.username); // Depuración
              await sendTempPasswordEmail(user.username, tempPassword);
              console.log('Email enviado exitosamente a:', user.username); // Depuración
              return res.status(401).json({
                error: 'Contraseña temporal expirada. Se ha enviado una nueva a tu email.',
              });
            } catch (error) {
              console.error('Error en el proceso de regeneración de contraseña:', error);
              return res.status(500).json({
                error: 'Contraseña temporal expirada, pero falló el proceso: ' + error.message,
              });
            }
          }

          // 4. Comparar contraseñas
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
          }

          // 5. Generar token
          const token = jwt.sign(
            { 
              id: user.id_usuario, 
              role: user.role 
            },
            process.env.JWT_SECRET || 'tu_secreto_seguro',
            { expiresIn: '1h' }
          );

          // 6. Respuesta exitosa
          res.json({ 
            username: user.username, 
            role: user.role,
            token 
          });
        }
      );
    } catch (err) {
      console.error('Error general en login:', err);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  });

  // Función para generar una contraseña temporal aleatoria
  function generateTempPassword() {
    const length = 10;
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const others = 'abcdefghijklmnopqrstuvwxyz!@#$%^&*';

    const getRandomChar = (str) => str[Math.floor(Math.random() * str.length)];
    const password = [
      getRandomChar(uppercase),
      getRandomChar(numbers),
      ...crypto.randomBytes(Math.max(0, length - 2)).toString('base64').slice(0, length - 2).replace(/[^a-zA-Z0-9]/g, '')
    ].sort(() => Math.random() - 0.5).join('').slice(0, length);

    return password;
  }

  return router;
};