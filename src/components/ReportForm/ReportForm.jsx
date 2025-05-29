import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { generateReport } from '../../services/reports';
import styles from './ReportForm.module.css';

export default function ReportForm({ idProyecto, onCancel }) { // Añadimos onCancel como prop
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [format, setFormat] = useState('pdf');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const blob = await generateReport(idProyecto, startDate, endDate, statusFilter, format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_${idProyecto}.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Error al generar el reporte: ${err.message}`);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Download size={28} className={styles.headerIcon} />
          <h2 className={styles.title}>Generar Reporte</h2>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="startDate" className={styles.label}>Fecha Inicio</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="endDate" className={styles.label}>Fecha Fin</label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="statusFilter" className={styles.label}>Estado</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.select}
            >
              <option value="">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Progreso">En Progreso</option>
              <option value="Completado">Completado</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="format" className={styles.label}>Formato</label>
            <select
              id="format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className={styles.select}
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
            </select>
          </div>
          <div className={styles.buttons}>
            <button type="submit" className={styles.submitButton}>
              Generar Reporte
            </button>
            <button
              type="button"
              onClick={onCancel} // Usamos la función onCancel pasada como prop
              className={styles.cancelButton}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}