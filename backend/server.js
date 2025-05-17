const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const requerimientosRouter = require('./routes/requerimientos');
const authenticateToken = require('./middleware/auth');

// Configuración CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/api/requerimientos', requerimientosRouter);

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

const JWT_SECRET = 'tu_secreto_seguro';

// Ruta para registro
app.post('/api/register', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    connection.query(
      'INSERT INTO Usuarios (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, role],
      (err, results) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'El usuario ya existe' });
          }
          return res.status(500).json({ error: 'Error al registrar usuario' });
        }
        res.status(201).json({ message: 'Usuario registrado' });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

// Ruta para login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  connection.query(
    'SELECT * FROM Usuarios WHERE username = ?',
    [username],
    async (err, results) => {
      if (err) return res.status(500).json({ error: 'Error en el servidor' });
      if (results.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ error: 'Contraseña incorrecta' });

      const token = jwt.sign(
        { id: user.id_usuario, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.json({ username: user.username, role: user.role, token });
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

// Ruta PUT para editar proyectos (NUEVA)
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