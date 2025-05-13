import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import styles from './RequirementCard.module.css';

export default function RequirementCard({ title, description, status, onEdit, onDelete }) {
  // Mapea el estado a un color de badge
  const statusClass = {
    Pendiente: styles.pendiente,
    'En Progreso': styles.enProgreso,
    Completado: styles.completado
  }[status] || styles.pendiente;

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.desc}>{description || 'Sin descripción'}</p>
      <span className={`${styles.badge} ${statusClass}`}>{status}</span>

      <div className={styles.actions}>
        <button onClick={onEdit} className={styles.btnEdit}>
          <Edit2 size={16} className={styles.icon} />
          Editar
        </button>
        <button onClick={onDelete} className={styles.btnDelete}>
          <Trash2 size={16} className={styles.icon} />
          Eliminar
        </button>
      </div>
    </div>
  );
}
