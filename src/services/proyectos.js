// src/services/proyectos.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getAuthToken = () => {
  const stored = localStorage.getItem('auth');
  return stored ? JSON.parse(stored).token : null;
};

export const fetchProyectos = () =>
  fetch(`${API_URL}/api/proyectos`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  }).then((res) => res.json());

export const saveProyecto = (proyecto, id) =>
  fetch(`${API_URL}/api/proyectos${id ? `/${id}` : ''}`, {
    method: id ? 'PUT' : 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(proyecto),
  }).then((res) => res.json());

export const deleteProyecto = (id) =>
  fetch(`${API_URL}/api/proyectos/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });