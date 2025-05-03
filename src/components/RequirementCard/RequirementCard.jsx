import React from 'react';
import styles from './RequirementCard.module.css';

const RequirementCard = ({ title, description, status, onEdit, onDelete }) => {
  return (
    <div className={styles['requirement-card']}>
      <h3>{title}</h3>
      {title !== 'CREAR PROYECTO' && (
        <>
          <p>{description || 'Sin descripción'}</p>
          <p>Estado: {status || 'Sin estado'}</p>
        </>
      )}
      {onEdit && onDelete && (
        <div className={styles['card-actions']}>
          <button onClick={onEdit}>Editar</button>
          <button onClick={onDelete}>Eliminar</button>
        </div>
      )}
    </div>
  );
};

export default RequirementCard;