const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234', // Cambia esto por tu contraseña de MySQL
  database: 'gestor_requerimientos'
});

connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a MySQL:', err);
    return;
  }
  console.log('Conectado a MySQL');
});

// Rutas para proyectos
app.get('/api/proyectos', (req, res) => {
  connection.query('SELECT * FROM Proyectos', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/proyectos', (req, res) => {
  const { nombre, descripcion, fecha_inicio, fecha_fin, creado_por } = req.body;
  connection.query(
    'INSERT INTO Proyectos (nombre, descripcion, fecha_inicio, fecha_fin, creado_por) VALUES (?, ?, ?, ?, ?)',
    [nombre, descripcion, fecha_inicio, fecha_fin, creado_por],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: results.insertId, nombre });
    }
  );
});

app.put('/api/proyectos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, fecha_inicio, fecha_fin } = req.body;
  connection.query(
    'UPDATE Proyectos SET nombre = ?, descripcion = ?, fecha_inicio = ?, fecha_fin = ? WHERE id_proyecto = ?',
    [nombre, descripcion, fecha_inicio, fecha_fin, id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.affectedRows === 0) return res.status(404).json({ error: 'Proyecto no encontrado' });
      res.json({ message: 'Proyecto actualizado' });
    }
  );
});

app.delete('/api/proyectos/:id', (req, res) => {
  const { id } = req.params;
  connection.query('DELETE FROM Proyectos WHERE id_proyecto = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json({ message: 'Proyecto eliminado' });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));