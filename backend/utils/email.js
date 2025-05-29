const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Función genérica para enviar correos
async function sendEmail(to, subject, content) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: content,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado exitosamente a:', to, 'Detalles:', info.response);
    return info;
  } catch (error) {
    console.error('Error al enviar email a', to, ':', error.message);
    console.error('Detalles del error:', error);
    throw new Error(`Error al enviar email: ${error.message}`);
  }
}

// Función para enviar correos de contraseña temporal (reutiliza sendEmail)
async function sendTempPasswordEmail(email, tempPassword, subject = 'Nueva Contraseña Temporal - Gestor de Requerimientos') {
  const content = `Tu nueva contraseña temporal es: ${tempPassword}\n\nExpira en 24 horas. Por favor, cámbiala lo antes posible.`;
  return await sendEmail(email, subject, content);
}

module.exports = { sendTempPasswordEmail, sendEmail };