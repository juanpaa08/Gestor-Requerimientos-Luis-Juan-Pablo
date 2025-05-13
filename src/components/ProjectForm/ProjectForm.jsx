import React from 'react';
import { PlusCircle, XCircle } from 'lucide-react';
import styles from './ProjectForm.module.css';

export default function ProjectForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isEditing
}) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.header}>
          <PlusCircle size={28} className={styles.headerIcon} />
          <h2 className={styles.title}>
            {isEditing ? 'Editar Proyecto' : 'Crear Proyecto'}
          </h2>
        </div>

        <form onSubmit={onSubmit} autoComplete="off" className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="nombre" className={styles.label}>
              Nombre del proyecto
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={onChange}
              placeholder="Ingresa el nombre"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="descripcion" className={styles.label}>
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={onChange}
              placeholder="Describe el proyecto"
              required
              className={styles.textarea}
              rows={4}
            />
          </div>

          <div className={styles.dateRow}>
            <div className={styles.formGroup}>
              <label htmlFor="fecha_inicio" className={styles.label}>
                Fecha de inicio
              </label>
              <input
                id="fecha_inicio"
                name="fecha_inicio"
                type="date"
                value={formData.fecha_inicio}
                onChange={onChange}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="fecha_fin" className={styles.label}>
                Fecha de fin
              </label>
              <input
                id="fecha_fin"
                name="fecha_fin"
                type="date"
                value={formData.fecha_fin}
                onChange={onChange}
                required
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="status" className={styles.label}>
              Estado
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={onChange}
              className={styles.select}
            >
              <option value="Pendiente">Pendiente</option>
              <option value="En Progreso">En Progreso</option>
              <option value="Completado">Completado</option>
            </select>
          </div>

          <div className={styles.buttons}>
            <button type="submit" className={styles.submitButton}>
              {isEditing ? 'Guardar Cambios' : 'Crear Proyecto'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className={styles.cancelButton}
            >
              <XCircle size={16} className={styles.cancelIcon} />
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}