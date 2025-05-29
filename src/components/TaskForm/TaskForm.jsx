import React, { useState, useEffect } from 'react';
import { PlusCircle, XCircle } from 'lucide-react';
import { fetchUsers } from '../../services/users'; // Nuevo
import styles from './TaskForm.module.css';

export default function TaskForm({ formData, onChange, onSubmit, onCancel, isEditing }) {
  const [users, setUsers] = useState([]); // Nuevo: Estado para almacenar la lista de usuarios

  // Cargar usuarios al montar el componente
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const userList = await fetchUsers();
        setUsers(userList);
      } catch (err) {
        console.error('Error al cargar usuarios:', err);
        setUsers([]);
      }
    };
    loadUsers();
  }, []);

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.header}>
          <PlusCircle size={28} className={styles.headerIcon} />
          <h2 className={styles.title}>
            {isEditing ? 'Editar Tarea' : 'Crear Tarea'}
          </h2>
        </div>
        <form onSubmit={onSubmit} autoComplete="off" className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="descripcion" className={styles.label}>
              Descripción
            </label>
            <input
              id="descripcion"
              name="descripcion"
              type="text"
              value={formData.descripcion}
              onChange={onChange}
              placeholder="Ingresa la descripción"
              required
              className={styles.input}
            />
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
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="fecha_limite" className={styles.label}>
              Fecha límite
            </label>
            <input
              id="fecha_limite"
              name="fecha_limite"
              type="date"
              value={formData.fecha_limite}
              onChange={onChange}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="asignado_a" className={styles.label}>
              Asignado a
            </label>
            <select
              id="asignado_a"
              name="asignado_a"
              value={formData.asignado_a || ''}
              onChange={onChange}
              className={styles.select}
            >
              <option value="">Ninguno</option>
              {users.map((user) => (
                <option key={user.id_usuario} value={user.id_usuario}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.buttons}>
            <button type="submit" className={styles.submitButton}>
              {isEditing ? 'Guardar Cambios' : 'Crear Tarea'}
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