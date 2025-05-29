const API_URL = 'http://localhost:5000/api/reports';

function getAuthHeader() {
  const stored = localStorage.getItem('auth');
  if (!stored) return {};
  const { token } = JSON.parse(stored);
  return { Authorization: `Bearer ${token}` };
}

export async function generateReport(idProyecto, startDate, endDate, statusFilter, format) {
  const res = await fetch(`${API_URL}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ idProyecto, startDate, endDate, statusFilter, format }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error ${res.status} al generar reporte: ${text}`);
  }
  return res.blob(); // Devuelve el archivo como blob para descargar
}