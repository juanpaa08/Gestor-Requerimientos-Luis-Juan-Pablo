const bcrypt = require('bcrypt');

const password = '123456';
const saltRounds = 10; // Asegúrate de que coincida con lo que usas en users.js

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error al generar hash:', err);
    return;
  }
  console.log('Hash generado:', hash);
});