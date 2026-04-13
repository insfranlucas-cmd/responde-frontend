// En dev usa el proxy de Vite (vite.config.js) para evitar CORS.
// En producción usa la variable de entorno o el URL directo al backend.
const BASE_URL = import.meta.env.DEV
  ? ""
  : import.meta.env.VITE_API_URL ||
    "https://responde-backend-production.up.railway.app";

// Helper para headers con JWT
function getAuthHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// ─────────────────────────────────────────────────────────────
// AUTENTICACIÓN
// ─────────────────────────────────────────────────────────────

/**
 * Registro de nuevo usuario con email y contraseña
 * @param {string} name - Nombre completo
 * @param {string} email - Email único
 * @param {string} password - Contraseña (mínimo 8 caracteres)
 * @returns {Promise<{token: string, user: {id: number, name: string, email: string, plan: string}}>}
 */
export async function signup(name, email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    // Manejar errores específicos según status code
    if (res.status === 409) throw new Error("Este email ya está registrado");
    if (res.status === 400)
      throw new Error(data.error || "Datos inválidos. Verificá los campos.");
    throw new Error(data.error || "Error al crear la cuenta");
  }
  return data;
}

/**
 * Login tradicional con email y contraseña
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, user: {id: number, name: string, email: string, plan: string}}>}
 */
export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) throw new Error("Email o contraseña incorrectos");
    if (res.status === 403)
      throw new Error("Tu cuenta está desactivada. Contactá a soporte.");
    throw new Error(data.error || "Error al iniciar sesión");
  }
  return data;
}

/**
 * Login con código de acceso de 3 caracteres (usuarios demo/prueba)
 * @param {string} accessCode - Código de 3 caracteres
 * @returns {Promise<{token: string, user: {id: number, name: string, email: string, plan: string}, loginMethod: string}>}
 */
export async function loginWithCode(accessCode) {
  const res = await fetch(`${BASE_URL}/api/auth/login-with-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessCode }),
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 403) throw new Error("Este código aún no fue activado");
    if (res.status === 404) throw new Error("Código no reconocido");
    throw new Error(data.error || "Código inválido");
  }
  return data;
}

/**
 * Logout - invalida el token JWT actual
 * @param {string} token - JWT token a invalidar
 * @returns {Promise<{message: string}>}
 */
export async function logout(token) {
  const res = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: getAuthHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al cerrar sesión");
  return data;
}

// ─────────────────────────────────────────────────────────────
// GENERACIÓN Y PERFILES
// ─────────────────────────────────────────────────────────────

/**
 * Obtiene estadísticas de uso del usuario autenticado
 * @param {string} token - JWT token
 * @returns {Promise<{user: string, plan: string, usage: {used: number, limit: number, remaining: number}}>}
 */
export async function getUsage(token) {
  const res = await fetch(`${BASE_URL}/api/usage`, {
    headers: getAuthHeaders(token),
  });

  if (res.status === 401) {
    throw new Error("TOKEN_EXPIRED");
  }

  if (!res.ok) throw new Error("Error al obtener estadísticas de uso");
  return res.json();
}

/**
 * Genera una respuesta usando IA
 * @param {string} token - JWT token
 * @param {object} payload - {mensaje, tono, extension, contexto_adicional?}
 * @returns {Promise<{respuesta: string, usage: object, tokens_usados: number}>}
 */
export async function generateResponse(token, payload) {
  const res = await fetch(`${BASE_URL}/api/generate`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json();

  // Si el token expiró o es inválido, lanzar error específico
  if (res.status === 401) {
    throw new Error("TOKEN_EXPIRED");
  }

  if (!res.ok) throw new Error(data.error || "Error al generar respuesta");
  return data;
}

/**
 * Obtiene el perfil del negocio del usuario
 * @param {string} token - JWT token
 * @returns {Promise<object|null>} - Perfil del negocio o null si no existe
 */
export async function getProfile(token) {
  const res = await fetch(`${BASE_URL}/api/profile`, {
    headers: getAuthHeaders(token),
  });

  // Si el token expiró o es inválido
  if (res.status === 401) {
    throw new Error("TOKEN_EXPIRED");
  }

  if (!res.ok) throw new Error("Error al obtener perfil");
  const data = await res.json();
  return data.profile; // null si no existe
}

/**
 * Guarda o actualiza el perfil del negocio (upsert)
 * @param {string} token - JWT token
 * @param {object} profile - Objeto con todos los campos del perfil
 * @returns {Promise<object>} - Perfil guardado
 */
export async function saveProfile(token, profile) {
  const res = await fetch(`${BASE_URL}/api/profile`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(profile),
  });

  // Si el token expiró o es inválido
  if (res.status === 401) {
    throw new Error("TOKEN_EXPIRED");
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al guardar perfil");
  return data.profile;
}
