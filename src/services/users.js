const API_URL = 'http://localhost:5000/api/users';

function getAuthHeader() {
  const stored = localStorage.getItem('auth');
  if (!stored) return {};
  const { token } = JSON.parse(stored);
  return { Authorization: `Bearer ${token}` };
}

export async function fetchUsers() {
  const res = await fetch(`${API_URL}/list-all`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error ${res.status} al cargar usuarios: ${text}`);
  }
  return res.json();
}