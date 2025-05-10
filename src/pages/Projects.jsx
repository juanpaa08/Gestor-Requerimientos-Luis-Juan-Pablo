// src/pages/Projects.jsx
import React, { useState, useEffect } from 'react';
import RequirementCard from '../components/RequirementCard/RequirementCard';
import { fetchProyectos, saveProyecto } from '../services/proyectos';
import styles from './Projects.module.css';

export default function Projects() {
  const [proyectos, setProyectos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  useEffect(() => {
    fetchProyectos()
      .then((data) => setProyectos(data))
      .catch((err) => console.error('Error al cargar proyectos:', err));
  }, []);

  const handleStatusChange = async (proyectoId, newStatus) => {
    try {
      await saveProyecto({ status: newStatus }, proyectoId);
      setProyectos((prev) =>
        prev.map((p) =>
          p.id_proyecto === proyectoId ? { ...p, status: newStatus } : p
        )
      );
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      alert('No se pudo actualizar el estado del proyecto.');
    }
  };

  const proyectosFiltrados = filtroEstado === 'Todos'
    ? proyectos
    : proyectos.filter((proyecto) => proyecto.status === filtroEstado);

  return (
    <div className={styles.container}>
      <h1>Lista de Proyectos</h1>
      <div>
        <label>Filtrar por estado: </label>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="Todos">Todos</option>
          <option value="Pendiente">Pendiente</option>
          <option value="En Progreso">En Progreso</option>
          <option value="Completado">Completado</option>
        </select>
      </div>
      <div className={styles.projectList}>
        {proyectosFiltrados.length > 0 ? (
          proyectosFiltrados.map((proyecto) => (
            <div key={proyecto.id_proyecto}>
              <RequirementCard
                title={proyecto.nombre}
                description={proyecto.descripcion}
                status={proyecto.status || 'Pendiente'}
              />
              <select
                value={proyecto.status || 'Pendiente'}
                onChange={(e) => handleStatusChange(proyecto.id_proyecto, e.target.value)}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En Progreso">En Progreso</option>
                <option value="Completado">Completado</option>
              </select>
            </div>
          ))
        ) : (
          <p>No hay proyectos con el estado seleccionado.</p>
        )}
      </div>
    </div>
  );
}