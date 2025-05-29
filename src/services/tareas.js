const API_URL = 'http://localhost:5000/api/tareas';

function getAuthHeader() {
  const stored = localStorage.getItem('auth');
  if (!stored) return {};
  const { token } = JSON.parse(stored);
  return { Authorization: `Bearer ${token}` };
}

export async function fetchTareas(idProyecto) {
  const res = await fetch(`${API_URL}/${idProyecto}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error ${res.status} al cargar tareas: ${text}`);
  }
  return res.json();
}

export async function saveTarea(data, idTarea) {
  const url = idTarea ? `${API_URL}/${idTarea}` : API_URL;
  const method = idTarea ? 'PUT' : 'POST';
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

export async function deleteTarea(idTarea) {
  const res = await fetch(`${API_URL}/${idTarea}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`(${res.status}) ${errText}`);
  }
  return res.json();
}