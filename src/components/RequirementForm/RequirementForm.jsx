// src/components/RequirementForm/RequirementForm.jsx
import React from 'react';
import { PlusCircle, XCircle } from 'lucide-react';
import styles from './RequirementForm.module.css';

export default function RequirementForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isEditing,
}) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.header}>
          <PlusCircle size={28} className={styles.headerIcon} />
          <h2 className={styles.title}>
            {isEditing ? 'Editar Requerimiento' : 'Crear Requerimiento'}
          </h2>
        </div>
        <div className={styles.formWrapper}>
          <form id="requirement-form" onSubmit={onSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="titulo" className={styles.label}>
                Título
              </label>
              <input
                id="titulo"
                name="titulo"
                type="text"
                value={formData.titulo}
                onChange={onChange}
                placeholder="Ingresa el título"
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
                placeholder="Describe el requerimiento"
                required
                className={styles.textarea}
                rows={4}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="tipo" className={styles.label}>
                Tipo
              </label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={onChange}
                className={styles.select}
              >
                <option value="Funcional">Funcional</option>
                <option value="No Funcional">No Funcional</option>
                <option value="Técnico">Técnico</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="prioridad" className={styles.label}>
                Prioridad
              </label>
              <select
                id="prioridad"
                name="prioridad"
                value={formData.prioridad}
                onChange={onChange}
                className={styles.select}
              >
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="estado" className={styles.label}>
                Estado
              </label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={onChange}
                className={styles.select}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En Progreso">En Progreso</option>
                <option value="Completado">Completado</option>
                <option value="En Revisión">En Revisión</option>
              </select>
            </div>
          </form>
        </div>
        <div className={styles.buttonContainer}>
          <button type="submit" form="requirement-form" className={styles.submitButton}>
            {isEditing ? 'Guardar Cambios' : 'Crear Requerimiento'}
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
      </div>
    </div>
  );
}