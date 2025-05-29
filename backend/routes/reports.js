const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const authenticateToken = require('../middleware/auth');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'gestor_requerimientos'
});

const logoPath = 'public/logo.png'; // Asegúrate de que esta ruta sea correcta

// Generar reporte
router.post('/generate', authenticateToken, async (req, res) => {
  const { idProyecto, startDate, endDate, statusFilter, format } = req.body;

  try {
    // Validar precondición: al menos una tarea registrada
    const [tasks] = await pool.query(
      'SELECT COUNT(*) as count FROM Tareas WHERE id_proyecto = ?',
      [idProyecto]
    );
    if (tasks[0].count === 0) {
      return res.status(400).json({ error: 'No hay tareas registradas para este proyecto' });
    }

    // Obtener tareas filtradas
    let query = 'SELECT * FROM Tareas WHERE id_proyecto = ?';
    const params = [idProyecto];
    if (startDate && endDate) {
      query += ' AND fecha_limite BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    if (statusFilter) {
      query += ' AND estado = ?';
      params.push(statusFilter);
    }
    const [taskData] = await pool.query(query, params);

    // Log para depuración
    console.log('Tareas obtenidas:', taskData);

    // Calcular métricas
    const totalTasks = taskData.length;
    const completedTasks = taskData.filter(t => t.estado === 'Completado').length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(2) : 0;
    const compliance = totalTasks > 0 ? `${completedTasks} / ${totalTasks}` : '0 / 0';

    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Disposition', `attachment; filename="reporte_${idProyecto}.pdf"`);
      res.setHeader('Content-Type', 'application/pdf');

      // Agregar logo (si lo tienes configurado, si no, mantenlo comentado)
      // doc.image(logoPath, 50, 50, { width: 100 });
      doc.moveDown();

      // Agregar fecha
      const currentDate = new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      doc.fontSize(12).text(`Reporte generado el: ${currentDate}`, { align: 'right' });
      doc.moveDown();

      // Título
      doc.fontSize(20).text(`Reporte de Avance - Proyecto ${idProyecto}`, { align: 'center' });
      doc.moveDown();

      // Progreso general
      doc.fontSize(14).text(`Progreso General: ${progress}%`, { underline: true });
      doc.moveDown();

      // Métricas de cumplimiento
      doc.text(`Tareas Completadas: ${compliance}`, { underline: true });
      doc.moveDown();

      // Lista de tareas
      doc.text('Lista de Tareas:', { underline: true });
      if (taskData.length === 0) {
        doc.fontSize(12).text('No hay tareas que cumplan con los filtros seleccionados.');
      } else {
        taskData.forEach((task, index) => {
          doc.text(`- ${index + 1}. Descripción: ${task.descripcion}, Estado: ${task.estado}, Prioridad: ${task.prioridad}`);
        });
      }

      doc.pipe(res);
      doc.end();
    } else if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const priorities = ['Alta', 'Media', 'Baja'];

      priorities.forEach(priority => {
        const worksheet = workbook.addWorksheet(priority);
        worksheet.columns = [
          { header: 'Descripción', key: 'descripcion', width: 30 },
          { header: 'Estado', key: 'estado', width: 15 },
          { header: 'Prioridad', key: 'prioridad', width: 15 },
          { header: 'Fecha Límite', key: 'fecha_limite', width: 15 }
        ];

        const filteredTasks = taskData.filter(t => t.prioridad === priority);
        filteredTasks.forEach(task => {
          worksheet.addRow({
            descripcion: task.descripcion,
            estado: task.estado,
            prioridad: task.prioridad,
            fecha_limite: task.fecha_limite
          });
        });
      });

      res.setHeader('Content-Disposition', `attachment; filename="reporte_${idProyecto}.xlsx"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      await workbook.xlsx.write(res);
      res.end();
    } else {
      res.status(400).json({ error: 'Formato no soportado' });
    }
  } catch (err) {
    console.error('Error al generar reporte:', err.message);
    res.status(500).json({ error: `Error al generar reporte: ${err.message}` });
  }
});

module.exports = (connection) => {
  return router;
};