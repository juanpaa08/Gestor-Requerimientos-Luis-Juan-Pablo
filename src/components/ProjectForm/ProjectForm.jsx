import React from 'react';
import styles from './ProjectForm.module.css';

export default function ProjectForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isEditing
}) {
  return (
    <div className={styles.formContainer}>
      <h2>{isEditing ? 'Editar Proyecto' : 'Crear Proyecto'}</h2>
      <form onSubmit={onSubmit}>
        <label htmlFor="nombre">Nombre del proyecto</label>
        <input
          id="nombre" type="text" name="nombre"
          value={formData.nombre}
          onChange={onChange}
          required
        />

        <label htmlFor="fecha_inicio">Fecha de inicio</label>
        <input
          id="fecha_inicio" type="date" name="fecha_inicio"
          value={formData.fecha_inicio}
          onChange={onChange}
          required
        />

        <label htmlFor="fecha_fin">Fecha de fin</label>
        <input
          id="fecha_fin" type="date" name="fecha_fin"
          value={formData.fecha_fin}
          onChange={onChange}
          required
        />

        <label htmlFor="descripcion">Descripción</label>
        <input
          id="descripcion" type="text" name="descripcion"
          value={formData.descripcion}
          onChange={onChange}
        />

        <div className={styles.buttons}>
          <button type="submit">
            {isEditing ? 'Guardar cambios' : 'Crear'}
          </button>
          <button type="button" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
