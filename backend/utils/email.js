// backend/utils/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendTempPasswordEmail(email, tempPassword) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Contraseña Temporal - Gestor de Requerimientos',
    text: `Tu contraseña temporal es: ${tempPassword}. Expira en 24 horas. Por favor, cámbiala al iniciar sesión.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email enviado exitosamente a:', email);
  } catch (error) {
    console.error('Error al enviar email:', error);
    throw error;
  }
}

module.exports = { sendTempPasswordEmail };