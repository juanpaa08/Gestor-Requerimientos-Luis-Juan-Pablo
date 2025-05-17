// src/pages/ProjectDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import RequirementCard from '../components/RequirementCard/RequirementCard';
import RequirementForm from '../components/RequirementForm/RequirementForm';
import { fetchRequerimientos, saveRequerimiento, deleteRequerimiento } from '../services/requerimientos';
import styles from './ProjectDetails.module.css';

export default function ProjectDetails() {
  const { idProyecto } = useParams();
  const [requerimientos, setRequerimientos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [requerimientoEditando, setRequerimientoEditando] = useState(null);
  const [formData, setFormData] = useState({
    id_proyecto: idProyecto,
    titulo: '',
    descripcion: '',
    tipo: 'Funcional',
    prioridad: 'Media',
    estado: 'Pendiente',
    asignado_a: null,
  });

  useEffect(() => {
    fetchRequerimientos(idProyecto)
      .then((data) => setRequerimientos(data))
      .catch((err) => {
        console.error(err);
        setRequerimientos([]);
      });
  }, [idProyecto]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const saved = await saveRequerimiento(formData, requerimientoEditando?.id_requerimiento);
      if (requerimientoEditando) {
        setRequerimientos((prev) =>
          prev.map((r) =>
            r.id_requerimiento === requerimientoEditando.id_requerimiento
              ? { ...r, ...formData }
              : r
          )
        );
      } else {
        setRequerimientos((prev) => [
          ...prev,
          { id_requerimiento: saved.id, ...formData },
        ]);
      }
      setMostrarFormulario(false);
      setRequerimientoEditando(null);
      setFormData({
        id_proyecto: idProyecto,
        titulo: '',
        descripcion: '',
        tipo: 'Funcional',
        prioridad: 'Media',
        estado: 'Pendiente',
        asignado_a: null,
      });
    } catch (err) {
      alert(`No se pudo guardar el requerimiento: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    await deleteRequerimiento(id);
    setRequerimientos((prev) => prev.filter((r) => r.id_requerimiento !== id));
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Requerimientos del Proyecto</h1>
        <button
          className={styles.primaryButton}
          onClick={() => {
            setRequerimientoEditando(null);
            setMostrarFormulario(true);
          }}
        >
          + Crear Requerimiento
        </button>
      </header>
      {mostrarFormulario ? (
        <RequirementForm
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={() => setMostrarFormulario(false)}
          isEditing={Boolean(requerimientoEditando)}
        />
      ) : (
        <div className={styles.requirementList}>
          {requerimientos.map((r) => (
            <RequirementCard
              key={r.id_requerimiento}
              title={r.titulo}
              description={r.descripcion}
              status={r.estado}
              onEdit={() => {
                setRequerimientoEditando(r);
                setFormData({
                  id_proyecto: idProyecto,
                  titulo: r.titulo,
                  descripcion: r.descripcion,
                  tipo: r.tipo,
                  prioridad: r.prioridad,
                  estado: r.estado,
                  asignado_a: r.asignado_a,
                });
                setMostrarFormulario(true);
              }}
              onDelete={() => handleDelete(r.id_requerimiento)}
            />
          ))}
        </div>
      )}
    </div>
  );
}