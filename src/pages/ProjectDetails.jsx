import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import RequirementCard from '../components/RequirementCard/RequirementCard';
import RequirementForm from '../components/RequirementForm/RequirementForm';
import TaskForm from '../components/TaskForm/TaskForm'; // Nuevo
import { fetchRequerimientos, saveRequerimiento, deleteRequerimiento } from '../services/requerimientos';
import { fetchTareas, saveTarea, deleteTarea } from '../services/tareas'; // Nuevo
import styles from './ProjectDetails.module.css';

export default function ProjectDetails() {
  const { idProyecto } = useParams();
  const [requerimientos, setRequerimientos] = useState([]);
  const [tareas, setTareas] = useState([]); // Nuevo
  const [mostrarFormularioReq, setMostrarFormularioReq] = useState(false); // Renombrado para claridad
  const [mostrarFormularioTarea, setMostrarFormularioTarea] = useState(false); // Nuevo
  const [requerimientoEditando, setRequerimientoEditando] = useState(null);
  const [tareaEditando, setTareaEditando] = useState(null); // Nuevo
  const [formDataReq, setFormDataReq] = useState({
    id_proyecto: idProyecto,
    titulo: '',
    descripcion: '',
    tipo: 'Funcional',
    prioridad: 'Media',
    estado: 'Pendiente',
    asignado_a: null,
  });
  const [formDataTarea, setFormDataTarea] = useState({ // Nuevo
    id_proyecto: idProyecto,
    descripcion: '',
    prioridad: 'Media',
    estado: 'Pendiente',
    fecha_limite: '',
    asignado_a: null,
  });

  useEffect(() => {
    fetchRequerimientos(idProyecto)
      .then((data) => setRequerimientos(data))
      .catch((err) => {
        console.error(err);
        setRequerimientos([]);
      });
    fetchTareas(idProyecto) // Nuevo
      .then((data) => setTareas(data))
      .catch((err) => {
        console.error(err);
        setTareas([]);
      });
  }, [idProyecto]);

  const handleChangeReq = (e) => {
    const { name, value } = e.target;
    setFormDataReq((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeTarea = (e) => { // Nuevo
    const { name, value } = e.target;
    setFormDataTarea((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitReq = async (e) => {
    e.preventDefault();
    try {
      const saved = await saveRequerimiento(formDataReq, requerimientoEditando?.id_requerimiento);
      if (requerimientoEditando) {
        setRequerimientos((prev) =>
          prev.map((r) =>
            r.id_requerimiento === requerimientoEditando.id_requerimiento
              ? { ...r, ...formDataReq }
              : r
          )
        );
      } else {
        setRequerimientos((prev) => [
          ...prev,
          { id_requerimiento: saved.id, ...formDataReq },
        ]);
      }
      setMostrarFormularioReq(false);
      setRequerimientoEditando(null);
      setFormDataReq({
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

  const handleSubmitTarea = async (e) => { // Nuevo
    e.preventDefault();
    try {
      const saved = await saveTarea(formDataTarea, tareaEditando?.id_tarea);
      if (tareaEditando) {
        setTareas((prev) =>
          prev.map((t) =>
            t.id_tarea === tareaEditando.id_tarea
              ? { ...t, ...formDataTarea }
              : t
          )
        );
      } else {
        setTareas((prev) => [
          ...prev,
          { id_tarea: saved.id, ...formDataTarea },
        ]);
      }
      setMostrarFormularioTarea(false);
      setTareaEditando(null);
      setFormDataTarea({
        id_proyecto: idProyecto,
        descripcion: '',
        prioridad: 'Media',
        estado: 'Pendiente',
        fecha_limite: '',
        asignado_a: null,
      });
    } catch (err) {
      alert(`No se pudo guardar la tarea: ${err.message}`);
    }
  };

  const handleDeleteReq = async (id) => {
    await deleteRequerimiento(id);
    setRequerimientos((prev) => prev.filter((r) => r.id_requerimiento !== id));
  };

  const handleDeleteTarea = async (id) => { // Nuevo
    await deleteTarea(id);
    setTareas((prev) => prev.filter((t) => t.id_tarea !== id));
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Requerimientos del Proyecto</h1>
        <button
          className={styles.primaryButton}
          onClick={() => {
            setRequerimientoEditando(null);
            setMostrarFormularioReq(true);
          }}
        >
          + Crear Requerimiento
        </button>
        <button // Nuevo
          className={styles.primaryButton}
          onClick={() => {
            setTareaEditando(null);
            setMostrarFormularioTarea(true);
          }}
        >
          + Crear Tarea
        </button>
      </header>
      {mostrarFormularioReq ? (
        <RequirementForm
          formData={formDataReq}
          onChange={handleChangeReq}
          onSubmit={handleSubmitReq}
          onCancel={() => setMostrarFormularioReq(false)}
          isEditing={Boolean(requerimientoEditando)}
        />
      ) : mostrarFormularioTarea ? ( // Nuevo
        <TaskForm
          formData={formDataTarea}
          onChange={handleChangeTarea}
          onSubmit={handleSubmitTarea}
          onCancel={() => setMostrarFormularioTarea(false)}
          isEditing={Boolean(tareaEditando)}
        />
      ) : (
        <>
          <div className={styles.requirementList}>
            {requerimientos.length === 0 ? (
              <p>No hay requerimientos para este proyecto.</p>
            ) : (
              requerimientos.map((r) => (
                <RequirementCard
                  key={r.id_requerimiento}
                  id={r.id_proyecto} // Asegúrate de que sea el ID correcto
                  title={r.titulo}
                  description={r.descripcion}
                  status={r.estado}
                  onEdit={() => {
                    setRequerimientoEditando(r);
                    setFormDataReq({
                      id_proyecto: idProyecto,
                      titulo: r.titulo,
                      descripcion: r.descripcion,
                      tipo: r.tipo,
                      prioridad: r.prioridad,
                      estado: r.estado,
                      asignado_a: r.asignado_a,
                    });
                    setMostrarFormularioReq(true);
                  }}
                  onDelete={() => handleDeleteReq(r.id_requerimiento)}
                />
              ))
            )}
          </div>
          <section> {/* Nueva sección para tareas */}
            <header className={styles.header}>
              <h2 className={styles.headerTitle}>Tareas del Proyecto</h2>
            </header>
            <div className={styles.requirementList}>
              {tareas.length === 0 ? (
                <p>No hay tareas asignadas a este proyecto.</p>
              ) : (
                tareas.map((t) => (
                  <RequirementCard
                    key={t.id_tarea}
                    id={t.id_proyecto}
                    title={t.descripcion}
                    description={`Prioridad: ${t.prioridad}, Fecha límite: ${t.fecha_limite}`}
                    status={t.estado}
                    onEdit={() => {
                      setTareaEditando(t);
                      setFormDataTarea({
                        id_proyecto: idProyecto,
                        descripcion: t.descripcion,
                        prioridad: t.prioridad,
                        estado: t.estado,
                        fecha_limite: t.fecha_limite,
                        asignado_a: t.asignado_a,
                      });
                      setMostrarFormularioTarea(true);
                    }}
                    onDelete={() => handleDeleteTarea(t.id_tarea)}
                  />
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}