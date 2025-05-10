// src/components/ProjectForm/ProjectForm.jsx
import React from 'react';
import styles from './ProjectForm.module.css';

export default function ProjectForm({ formData, onChange, onSubmit, onCancel, isEditing }) {
  return (
    <div className={styles.formContainer}>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre del proyecto"
          value={formData.nombre}
          onChange={onChange}
          required
        />
        <textarea
          name="descripcion"
          placeholder="Descripción"
          value={formData.descripcion}
          onChange={onChange}
          required
        />
        <input
          type="date"
          name="fecha_inicio"
          value={formData.fecha_inicio}
          onChange={onChange}
          required
        />
        <input
          type="date"
          name="fecha_fin"
          value={formData.fecha_fin}
          onChange={onChange}
          required
        />
        <select name="status" value={formData.status} onChange={onChange}>
          <option value="Pendiente">Pendiente</option>
          <option value="En Progreso">En Progreso</option>
          <option value="Completado">Completado</option>
        </select>
        <button type="submit">{isEditing ? 'Guardar Cambios' : 'Crear Proyecto'}</button>
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
      </form>
    </div>
  );
}