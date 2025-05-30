require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendTempPasswordEmail } = require('./utils/email.js'); // Importamos la función de email
const crypto = require('crypto'); // Para generar contraseñas aleatorias
const app = express();

// Configuración de la conexión a MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'gestor_requerimientos',
});

connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a MySQL:', err);
    return;
  }
  console.log('Conectado a MySQL');
});

// Importar routers (sin authRouter, ya que lo manejaremos aquí)
const requerimientosRouter = require('./routes/requerimientos')(connection);
const usersRouter = require('./routes/users')(connection);
const authenticateToken = require('./middleware/auth');
const reportsRouter = require('./routes/reports')(connection); // Nuevo

// Configuración CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/api/requerimientos', requerimientosRouter);
app.use('/api/users', usersRouter);
app.use('/api/reports', reportsRouter);

// Nuevo router para tareas
const tareasRouter = require('./routes/tareas')(connection);
app.use('/api/tareas', tareasRouter);

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_seguro';

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

// Ruta para login con manejo de intentos fallidos
app.post('/api/login', (req, res) => {
  const { username, password, role } = req.body;

  try {
    console.log('Procesando login para:', username, 'con rol:', role); // Depuración
    connection.query(
      'SELECT * FROM Usuarios WHERE username = ? AND role = ?', // Filtramos por ambos campos
      [username, role],
      async (err, results) => {
        if (err) {
          console.error('Error en la consulta SQL:', err);
          return res.status(500).json({ error: 'Error en el servidor al consultar usuario' });
        }

        console.log('Resultado de la consulta:', results); // Depuración
        if (results.length === 0) {
          return res.status(401).json({ error: 'Usuario no encontrado o rol incorrecto' });
        }

        const user = results[0];
        console.log('Usuario encontrado:', user); // Depuración

        // Verificar si la cuenta está bloqueada
        const now = new Date();
        if (user.locked_until && new Date(user.locked_until) > now) {
          const remainingTime = Math.ceil((new Date(user.locked_until) - now) / 1000 / 60); // Minutos restantes
          return res.status(403).json({
            error: `Cuenta bloqueada. Intenta de nuevo en ${remainingTime} minutos o contacta al Super Admin.`,
          });
        }

        // Verificar contraseña temporal (si aplica)
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

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          // Incrementar el contador de intentos fallidos
          const newAttempts = user.failed_attempts + 1; // Cambiado a failed_attempts
          let lockedUntil = null;

          if (newAttempts >= 3) {
            // Bloquear la cuenta por 30 minutos
            lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
            console.log(`Cuenta bloqueada para ${user.username} hasta:`, lockedUntil);
          }

          await new Promise((resolve, reject) => {
            connection.query(
              'UPDATE Usuarios SET failed_attempts = ?, locked_until = ? WHERE id_usuario = ?', // Cambiado a failed_attempts
              [newAttempts, lockedUntil, user.id_usuario],
              (err, result) => {
                if (err) {
                  console.error('Error al actualizar intentos fallidos:', err);
                  reject(new Error('Error al actualizar intentos fallidos: ' + err.message));
                } else {
                  resolve();
                }
              }
            );
          });

          if (newAttempts >= 3) {
            return res.status(403).json({
              error: 'Cuenta bloqueada por demasiados intentos fallidos. Intenta de nuevo en 30 minutos.',
            });
          }

          return res.status(401).json({ error: `Contraseña incorrecta. Intento ${newAttempts}/3.` });
        }

        // Login exitoso: Restablecer intentos fallidos y desbloquear
        await new Promise((resolve, reject) => {
          connection.query(
            'UPDATE Usuarios SET failed_attempts = 0, locked_until = NULL WHERE id_usuario = ?', // Cambiado a failed_attempts
            [user.id_usuario],
            (err, result) => {
              if (err) {
                console.error('Error al restablecer intentos fallidos:', err);
                reject(new Error('Error al restablecer intentos fallidos: ' + err.message));
              } else {
                resolve();
              }
            }
          );
        });

        // Generar token JWT (incluyendo el rol de la BD)
        const token = jwt.sign(
          { 
            id: user.id_usuario, 
            username: user.username, 
            role: user.role 
          },
          JWT_SECRET,
          { expiresIn: '1h' }
        );

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

// Nueva ruta para desbloquear usuarios (Super Admin)
app.post('/api/users/unlock/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  // Verificar que el usuario autenticado sea un Super Admin
  if (req.user.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Solo un Super Admin puede desbloquear cuentas.' });
  }

  try {
    await new Promise((resolve, reject) => {
      connection.query(
        'UPDATE Usuarios SET failed_attempts = 0, locked_until = NULL WHERE id_usuario = ?', // Cambiado a failed_attempts
        [id],
        (err, result) => {
          if (err) {
            console.error('Error al desbloquear usuario:', err);
            reject(new Error('Error al desbloquear usuario: ' + err.message));
          }
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
          }
          resolve();
        }
      );
    });

    res.json({ message: 'Cuenta desbloqueada exitosamente.' });
  } catch (err) {
    console.error('Error al desbloquear usuario:', err);
    res.status(500).json({ error: err.message });
  }
});

// Rutas para proyectos
app.get('/api/proyectos', authenticateToken, (req, res) => {
  connection.query('SELECT * FROM Proyectos', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/proyectos', authenticateToken, (req, res) => {
  const { nombre, descripcion, fecha_inicio, fecha_fin, creado_por, status } = req.body;
  connection.query(
    'INSERT INTO Proyectos (nombre, descripcion, fecha_inicio, fecha_fin, creado_por, status) VALUES (?, ?, ?, ?, ?, ?)',
    [nombre, descripcion, fecha_inicio, fecha_fin, creado_por, status || 'Pendiente'],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: results.insertId, nombre });
    }
  );
});

app.put('/api/proyectos/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, fecha_inicio, fecha_fin, status } = req.body;
  connection.query(
    'UPDATE Proyectos SET nombre = ?, descripcion = ?, fecha_inicio = ?, fecha_fin = ?, status = ? WHERE id_proyecto = ?',
    [nombre, descripcion, fecha_inicio, fecha_fin, status, id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
      }
      res.json({ message: 'Proyecto actualizado' });
    }
  );
});

app.delete('/api/proyectos/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  connection.query('DELETE FROM Proyectos WHERE id_proyecto = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json({ message: 'Proyecto eliminado' });
  });
});

// Manejadores de errores y rutas no encontradas
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use((err, req, res, next) => {
  console.error('Error interno:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));