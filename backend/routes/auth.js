// routes/auth.js
const express    = require('express');
const bcrypt     = require('bcrypt');
const jwt        = require('jsonwebtoken');
const crypto     = require('crypto');
const { sendTempPasswordEmail } = require('../utils/email');

module.exports = (connection) => {
  const router     = express.Router();
  const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_seguro';

  // Genera una contraseña temporal de 10 caracteres
  function generateTempPassword() {
    const upper  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const pick   = str => str[Math.floor(Math.random() * str.length)];
    const rest   = crypto.randomBytes(8)
      .toString('base64')
      .replace(/[^A-Za-z0-9]/g, '')
      .slice(0, 8);
    return [pick(upper), pick(digits), ...rest]
      .sort(() => Math.random() - 0.5)
      .join('')
      .slice(0, 10);
  }

  // POST /api/login
  router.post('/', (req, res) => {
    const { username, password, role } = req.body;

    // 1) Buscar usuario por username
    connection.query(
      'SELECT * FROM Usuarios WHERE username = ?',
      [username],
      async (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error en DB al buscar usuario' });
        if (rows.length === 0) {
          return res.status(401).json({ error: 'Usuario no encontrado' });
        }
        const user = rows[0];

        // 2) ¿Cuenta bloqueada?
        if (user.locked_until && new Date() < new Date(user.locked_until)) {
          return res.status(403).json({
            error: 'Cuenta bloqueada hasta ' + new Date(user.locked_until).toLocaleString()
          });
        }

        // 3) Validar rol
        if (user.role !== role) {
          return res.status(401).json({ error: 'Rol incorrecto' });
        }

        // 4) Comparar contraseña
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          // -- Falló: incrementar intentos
          const fails = user.failed_attempts + 1;
          // -- Si es el tercero, bloquear por 30 min
          const lockU = fails >= 3
            ? new Date(Date.now() + 30 * 60 * 1000)
            : null;

          connection.query(
            'UPDATE Usuarios SET failed_attempts = ?, locked_until = ? WHERE id_usuario = ?',
            [fails, lockU, user.id_usuario]
          );

          if (lockU) {
            return res.status(401).json({
              error: '3 intentos fallidos. Cuenta bloqueada 30 minutos.'
            });
          }

          return res.status(401).json({
            error: `Contraseña incorrecta. Te quedan ${3 - fails} intento(s).`
          });
        }

        // 5) Éxito: resetear contador y desbloquear
        connection.query(
          'UPDATE Usuarios SET failed_attempts = 0, locked_until = NULL WHERE id_usuario = ?',
          [user.id_usuario]
        );

        // 6) Contraseña temporal expirada?
        if (user.temp_password_expires && new Date() > new Date(user.temp_password_expires)) {
          try {
            const temp = generateTempPassword();
            const hash = await bcrypt.hash(temp, 10);
            const exp  = new Date(Date.now() + 24 * 3600 * 1000);
            await new Promise((r, rej) => {
              connection.query(
                'UPDATE Usuarios SET password = ?, temp_password_expires = ? WHERE id_usuario = ?',
                [hash, exp, user.id_usuario],
                err => err ? rej(err) : r()
              );
            });
            await sendTempPasswordEmail(user.username, temp);
            return res.status(401).json({
              error: 'Contraseña temporal expirada. Se envió nueva a tu email.'
            });
          } catch (e) {
            return res.status(500).json({
              error: 'Error regenerando contraseña temporal: ' + e.message
            });
          }
        }

        // 7) Generar JWT
        const token = jwt.sign(
          { id: user.id_usuario, username: user.username, role: user.role },
          JWT_SECRET,
          { expiresIn: '1h' }
        );

        // 8) Devolver resultado
        res.json({ username: user.username, role: user.role, token });
      }
    );
  });

  return router;
};
