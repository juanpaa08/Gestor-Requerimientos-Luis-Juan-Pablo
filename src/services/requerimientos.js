// src/services/requerimientos.js
const API_URL = 'http://localhost:5000/api/requerimientos';

function getAuthHeader() {
  const stored = localStorage.getItem('auth');
  if (!stored) return {};
  const { token } = JSON.parse(stored);
  return { Authorization: `Bearer ${token}` };
}

export async function fetchRequerimientos(idProyecto) {
  const res = await fetch(`${API_URL}/${idProyecto}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error ${res.status} al cargar requerimientos: ${text}`);
  }
  return res.json();
}

export async function saveRequerimiento(data, idRequerimiento) {
  const url = idRequerimiento ? `${API_URL}/${idRequerimiento}` : API_URL;
  const method = idRequerimiento ? 'PUT' : 'POST';
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

export async function deleteRequerimiento(idRequerimiento) {
  const res = await fetch(`${API_URL}/${idRequerimiento}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`(${res.status}) ${errText}`);
  }
  return res.json();
}