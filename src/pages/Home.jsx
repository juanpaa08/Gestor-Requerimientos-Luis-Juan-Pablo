// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import RequirementCard from '../components/RequirementCard/RequirementCard';
import ProjectForm from '../components/ProjectForm/ProjectForm';
import styles from './Home.module.css';
import {
  fetchProyectos,
  saveProyecto,
  deleteProyecto
} from '../services/proyectos';

export default function Home() {
  const [proyectos, setProyectos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [proyectoEditando, setProyectoEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    status: 'Pendiente'
  });

  useEffect(() => {
    fetchProyectos()
      .then((data) => setProyectos(data))
      .catch((err) => {
        console.error(err);
        setProyectos([]);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const inicio = new Date(formData.fecha_inicio);
    const fin = new Date(formData.fecha_fin);
    if (fin < inicio) {
      return alert('Fecha de fin no puede ser anterior a inicio');
    }

    try {
      const saved = await saveProyecto(
        { ...formData, creado_por: 'admin' },
        proyectoEditando?.id_proyecto
      );

      if (proyectoEditando) {
        setProyectos((prev) =>
          prev.map((p) =>
            p.id_proyecto === proyectoEditando.id_proyecto
              ? { ...p, ...formData }
              : p
          )
        );
      } else {
        setProyectos((prev) => [
          ...prev,
          { id_proyecto: saved.id, ...formData }
        ]);
      }

      setMostrarFormulario(false);
      setProyectoEditando(null);
      setFormData({
        nombre: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        status: 'Pendiente'
      });
    } catch (err) {
      console.error('Error al guardar proyecto:', err);
      alert(`No se pudo guardar el proyecto:\n${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    await deleteProyecto(id);
    setProyectos((prev) => prev.filter((p) => p.id_proyecto !== id));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>BrightReq</h1>

      <div className={styles.buttonsRow}>
        <button
          className={styles.mainButton}
          onClick={() => {
            setProyectoEditando(null);
            setMostrarFormulario(true);
          }}
        >
          Crear Proyecto
        </button>
        <button
          className={styles.mainButtonOutline}
          onClick={() => setMostrarFormulario(false)}
        >
          Editar Proyectos
        </button>
      </div>

      {mostrarFormulario ? (
        <ProjectForm
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={() => setMostrarFormulario(false)}
          isEditing={Boolean(proyectoEditando)}
        />
      ) : (
        <div className={styles.projectList}>
          {proyectos.map((p) => (
            <RequirementCard
              key={p.id_proyecto}
              id={p.id_proyecto}
              title={p.nombre}
              description={p.descripcion}
              status={p.status}
              onEdit={() => {
                setProyectoEditando(p);
                setFormData({
                  nombre: p.nombre,
                  descripcion: p.descripcion,
                  fecha_inicio: p.fecha_inicio,
                  fecha_fin: p.fecha_fin,
                  status: p.status
                });
                setMostrarFormulario(true);
              }}
              onDelete={() => handleDelete(p.id_proyecto)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
