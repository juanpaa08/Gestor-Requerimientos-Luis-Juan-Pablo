// backend/server.js
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

// Importar routers después de definir connection
const requerimientosRouter = require('./routes/requerimientos')(connection);
const usersRouter = require('./routes/users')(connection);
const authRouter = require('./routes/auth')(connection);
console.log('authRouter:', authRouter);
const authenticateToken = require('./middleware/auth');

// Configuración CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/requerimientos', requerimientosRouter);
app.use('/api/users', usersRouter);

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_seguro';

// Ruta para login (actualizada para validar el rol)
app.post('/api/login', (req, res) => {
  const { username, password, role } = req.body; // Añadimos 'role' en la destructuración

  connection.query(
    'SELECT * FROM Usuarios WHERE username = ? AND role = ?', // Filtramos por ambos campos
    [username, role],
    async (err, results) => {
      if (err) {
        console.error('Error en la consulta:', err);
        return res.status(500).json({ error: 'Error en el servidor' });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: 'Usuario no encontrado o rol incorrecto' });
      }

      const user = results[0];

      // Verificar contraseña
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }

      // Verificar expiración de contraseña temporal
      if (user.temp_password_expires && new Date() > new Date(user.temp_password_expires)) {
        return res.status(401).json({ error: 'Contraseña temporal expirada' });
      }

      // Generar token JWT (incluyendo el rol de la BD)
      const token = jwt.sign(
        { 
          id: user.id_usuario, 
          username: user.username, 
          role: user.role // Usamos el rol de la BD
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

const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));