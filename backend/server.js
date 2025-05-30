// server.js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const mysql   = require('mysql2');

const authRouter           = require('./routes/auth');
const usersRouter          = require('./routes/users');
const requerimientosRouter = require('./routes/requerimientos');
const tareasRouter         = require('./routes/tareas');
const reportsRouter        = require('./routes/reports');

const app  = express();
const PORT = process.env.PORT || 5000;

// 1) Conexión a MySQL
const connection = mysql.createConnection({
  host:     'localhost',
  user:     'root',
  password: '1234',
  database: 'gestor_requerimientos',
});
connection.connect(err => {
  if (err) {
    console.error('❌ Error conectando a MySQL:', err);
    process.exit(1);
  }
  console.log('✅ MySQL conectado');
});

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type','Authorization']
}));
app.use(express.json());

// 2) Rutas
// Login y bloqueo por intentos fallidos
app.use('/api/login', authRouter(connection));

// Demás endpoints (sin tocar)
app.use('/api/users',          usersRouter(connection));
app.use('/api/requerimientos', requerimientosRouter(connection));
app.use('/api/tareas',         tareasRouter(connection));
app.use('/api/reports',        reportsRouter(connection));

// 404 y manejo de errores
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use((err, req, res, next) => {
  console.error('💥 Error interno:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () =>
  console.log(`🚀 API escuchando en http://localhost:${PORT}`)
);
