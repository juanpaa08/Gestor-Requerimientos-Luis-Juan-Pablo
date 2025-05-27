const nodemailer = require('nodemailer');

// Configuración del transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  logger: true, // Habilita logs detallados
  debug: true, // Muestra información de depuración
});

// Verificar la conexión con el servidor de email al iniciar
transporter.verify((error, success) => {
  if (error) {
    console.error('Error al verificar el transporter:', error);
  } else {
    console.log('Transporter verificado correctamente:', success);
  }
});

async function sendTempPasswordEmail(email, tempPassword) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Nueva Contraseña Temporal - Gestor de Requerimientos',
    text: `Tu nueva contraseña temporal es: ${tempPassword}. Expira en 24 horas. Por favor, cámbiala al iniciar sesión.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado exitosamente a:', email, 'Detalles:', info.response);
    return info;
  } catch (error) {
    console.error('Error al enviar email a', email, ':', error.message);
    console.error('Detalles del error:', error);
    throw new Error(`Error al enviar email: ${error.message}`);
  }
}

module.exports = { sendTempPasswordEmail };