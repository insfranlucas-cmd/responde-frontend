const BASE_URL = import.meta.env.VITE_API_URL || 'https://responde-backend-production.up.railway.app';

function headers(accessCode) {
  return {
    'Content-Type': 'application/json',
    'X-Access-Code': accessCode,
  };
}

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
    headers: headers(accessCode),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al generar respuesta');
  return data;
}

export async function getProfile(accessCode) {
  const res = await fetch(`${BASE_URL}/api/profile`, {
    headers: { 'X-Access-Code': accessCode },
  });
  if (!res.ok) throw new Error('Error al obtener perfil');
  const data = await res.json();
  return data.profile; // null si no existe
}

export async function saveProfile(accessCode, profile) {
  const res = await fetch(`${BASE_URL}/api/profile`, {
    method: 'POST',
    headers: headers(accessCode),
    body: JSON.stringify(profile),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al guardar perfil');
  return data.profile;
}
