const BASE_URL = import.meta.env.VITE_API_URL || 'https://responde-backend-production.up.railway.app';

export async function checkCode(accessCode) {
  const res = await fetch(`${BASE_URL}/api/usage`, {
    headers: { 'X-Access-Code': accessCode },
  });
  if (!res.ok) throw new Error('Código inválido');
  return res.json();
}

export async function generateResponse(accessCode, payload) {
  const res = await fetch(`${BASE_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Access-Code': accessCode,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al generar respuesta');
  return data;
}
