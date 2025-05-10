// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import RequirementCard from '../components/RequirementCard/RequirementCard';
import ProjectForm from '../components/ProjectForm/ProjectForm';
import styles from './Home.module.css';
import { fetchProyectos, saveProyecto, deleteProyecto } from '../services/proyectos';

const Home = () => {
  const [proyectos, setProyectos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [proyectoEditando, setProyectoEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    status: 'Pendiente', // Nuevo campo
  });
  const [mostrarProyectosCreados, setMostrarProyectosCreados] = useState(false);

  useEffect(() => {
    fetchProyectos()
      .then((data) => setProyectos(data))
      .catch((err) => console.error('Error al cargar proyectos:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fechaInicio = new Date(formData.fecha_inicio);
    const fechaFin = new Date(formData.fecha_fin);

    if (fechaFin < fechaInicio) {
      alert('La fecha de fin no puede ser anterior a la fecha de inicio');
      return;
    }

    const proyecto = { ...formData, creado_por: 'admin' };
    try {
      const data = await saveProyecto(proyecto, proyectoEditando?.id_proyecto);
      if (proyectoEditando) {
        setProyectos((prev) =>
          prev.map((p) =>
            p.id_proyecto === proyectoEditando.id_proyecto
              ? { ...p, ...proyecto }
              : p
          )
        );
      } else {
        setProyectos((prev) => [...prev, { id_proyecto: data.id, ...proyecto }]);
      }
      setMostrarFormulario(false);
      setProyectoEditando(null);
      setFormData({ nombre: '', descripcion: '', fecha_inicio: '', fecha_fin: '', status: 'Pendiente' });
    } catch (err) {
      console.error('Error al guardar proyecto:', err);
      alert('No se pudo guardar el proyecto. Asegúrate de que el backend esté corriendo en http://localhost:5000.');
    }
  };

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

  return (
    <div className={styles.container}>
      <h1 className={styles['brightreq-title']}>BrightReq</h1>
      <div className={styles.buttonContainer}>
        <button
          className={styles.mainButton}
          onClick={() => setMostrarFormulario(true)}
        >
          Crear Proyecto
        </button>
        <button
          className={styles.mainButton}
          onClick={() => setMostrarProyectosCreados(true)}
        >
          Editar Proyectos
        </button>
      </div>

      {mostrarFormulario && (
        <ProjectForm
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={() => {
            setMostrarFormulario(false);
            setProyectoEditando(null);
            setFormData({ nombre: '', descripcion: '', fecha_inicio: '', fecha_fin: '', status: 'Pendiente' });
          }}
          isEditing={Boolean(proyectoEditando)}
        />
      )}

      {mostrarProyectosCreados && (
        <div className={styles.proyectosCreados}>
          <h2>Proyectos Creados</h2>
          {proyectos.length > 0 ? (
            proyectos.map((proyecto) => (
              <div key={proyecto.id_proyecto}>
                <RequirementCard
                  title={proyecto.nombre}
                  description={proyecto.descripcion}
                  status={proyecto.status || 'Pendiente'}
                  onEdit={() => {
                    setProyectoEditando(proyecto);
                    setFormData({
                      nombre: proyecto.nombre,
                      descripcion: proyecto.descripcion,
                      fecha_inicio: proyecto.fecha_inicio,
                      fecha_fin: proyecto.fecha_fin,
                      status: proyecto.status || 'Pendiente',
                    });
                    setMostrarFormulario(true);
                    setMostrarProyectosCreados(false);
                  }}
                  onDelete={() => {
                    deleteProyecto(proyecto.id_proyecto)
                      .then((response) => {
                        if (response.ok) {
                          setProyectos((prev) =>
                            prev.filter((p) => p.id_proyecto !== proyecto.id_proyecto)
                          );
                        }
                      })
                      .catch((err) => console.error('Error al eliminar:', err));
                  }}
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
            <p>No hay proyectos creados.</p>
          )}
          <button
            className={styles.mainButton}
            onClick={() => setMostrarProyectosCreados(false)}
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;