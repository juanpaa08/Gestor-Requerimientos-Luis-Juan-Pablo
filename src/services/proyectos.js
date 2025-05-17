// src/services/proyectos.js

const API_URL = 'http://localhost:5000/api/proyectos';

function getAuthHeader() {
  // si guardas el token en localStorage bajo "auth":
  const stored = localStorage.getItem('auth');
  if (!stored) return {};
  const { token } = JSON.parse(stored);
  return { Authorization: `Bearer ${token}` };
}

export async function fetchProyectos() {
  const res = await fetch(API_URL, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error ${res.status} al cargar proyectos: ${text}`);
  }
  return res.json();
}

export async function saveProyecto(data, idProyecto) {
  const url = idProyecto ? `${API_URL}/${idProyecto}` : API_URL;
  const method = idProyecto ? 'PUT' : 'POST';
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`(${res.status}) ${errText}`);
  }
  return res.json();
}

export async function deleteProyecto(idProyecto) {
  return fetch(`${API_URL}/${idProyecto}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
}