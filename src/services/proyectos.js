const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const fetchProyectos = () =>
  fetch(`${API_URL}/api/proyectos`).then(res => res.json());

export const saveProyecto = (proyecto, id) =>
  fetch(`${API_URL}/api/proyectos${id ? `/${id}` : ''}`, {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(proyecto),
  }).then(res => res.json());

export const deleteProyecto = id =>
  fetch(`${API_URL}/api/proyectos/${id}`, { method: 'DELETE' });
