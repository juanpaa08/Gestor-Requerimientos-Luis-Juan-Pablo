// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No autorizado' });

  const token = authHeader.split(' ')[1];
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_seguro');
    req.user = user;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Token inválido' });
  }
};

module.exports = authenticateToken;