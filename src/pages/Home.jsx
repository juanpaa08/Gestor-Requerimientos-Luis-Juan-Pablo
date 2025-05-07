import React, { useState, useEffect } from 'react';
import RequirementCard from '../components/RequirementCard/RequirementCard';
import ProjectForm from '../components/ProjectForm/ProjectForm';
import styles from './Home.module.css';


const Home = () => {
  const [proyectos, setProyectos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [proyectoEditando, setProyectoEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
  });
  const [mostrarProyectosCreados, setMostrarProyectosCreados] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/proyectos')
      .then((response) => response.json())
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
    const url = proyectoEditando
      ? `http://localhost:5000/api/proyectos/${proyectoEditando.id_proyecto}`
      : 'http://localhost:5000/api/proyectos';
    const method = proyectoEditando ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proyecto),
      });
      if (!response.ok) throw new Error('Error en la respuesta del servidor');
      const data = await response.json();

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
      setFormData({ nombre: '', descripcion: '', fecha_inicio: '', fecha_fin: '' });
    } catch (err) {
      console.error('Error al guardar proyecto:', err);
      alert('No se pudo guardar el proyecto. Asegúrate de que el backend esté corriendo en http://localhost:5000.');
    }
  };

  return (
    <div className={styles.container}>
      <h1>BrightReq</h1>
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
            setFormData({ nombre: '', descripcion: '', fecha_inicio: '', fecha_fin: '' });
          }}
          isEditing={Boolean(proyectoEditando)}
        />
      )}

      {mostrarProyectosCreados && (
        <div className={styles.proyectosCreados}>
          <h2>Proyectos Creados</h2>
          {proyectos.length > 0 ? (
            proyectos.map((proyecto) => (
              <RequirementCard
                key={proyecto.id_proyecto}
                title={proyecto.nombre}
                description={proyecto.descripcion}
                status={proyecto.status || 'Sin estado'}
                onEdit={() => {
                  setProyectoEditando(proyecto);
                  setFormData({
                    nombre: proyecto.nombre,
                    descripcion: proyecto.descripcion,
                    fecha_inicio: proyecto.fecha_inicio,
                    fecha_fin: proyecto.fecha_fin,
                  });
                  setMostrarFormulario(true);
                  setMostrarProyectosCreados(false);
                }}
                onDelete={() => {
                  fetch(
                    `http://localhost:5000/api/proyectos/${proyecto.id_proyecto}`,
                    { method: 'DELETE' }
                  )
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
