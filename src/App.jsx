import { useState, useEffect } from "react";
import LoginScreen from "./components/LoginScreen";
import ProfileScreen from "./components/ProfileScreen";
import GenerateScreen from "./components/GenerateScreen";
import { getProfile, logout } from "./api";
import "./index.css";

const SESSION_KEY = "responde_session";
const PROFILE_KEY = "responde_profile";

export default function App() {
  const [screen, setScreen] = useState("loading");
  const [session, setSession] = useState(null); // { token, user: { id, name, email, plan } }
  const [profile, setProfile] = useState(null);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState(null);

  useEffect(() => {
    const savedSession = localStorage.getItem(SESSION_KEY);
    if (!savedSession) {
      setScreen("login");
      return;
    }

    try {
      const s = JSON.parse(savedSession);

      // Validar que tenga la estructura correcta de JWT
      if (!s.token || !s.user) {
        throw new Error("Sesión inválida");
      }

      setSession(s);

      // Intentar cargar perfil desde cache
      const cachedProfile = localStorage.getItem(PROFILE_KEY);
      if (cachedProfile) {
        setProfile(JSON.parse(cachedProfile));
        setScreen("generate");
      } else {
        // Cargar perfil desde API
        getProfile(s.token)
          .then((p) => {
            if (p) {
              localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
              setProfile(p);
              setScreen("generate");
            } else {
              // Primera vez - no tiene perfil
              setScreen("profile");
            }
          })
          .catch((err) => {
            // Si el token expiró al intentar cargar el perfil
            if (err.message === "TOKEN_EXPIRED") {
              handleTokenExpired();
            } else {
              // Otro error - ir a crear perfil
              setScreen("profile");
            }
          });
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(PROFILE_KEY);
      setScreen("login");
    }
  }, []);

  /**
   * Maneja el login exitoso - recibe { token, user } desde LoginScreen
   */
  function handleLogin(result) {
    const { token, user } = result;
    const s = { token, user };

    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setSession(s);
    setSessionExpiredMessage(null); // Limpiar mensaje de sesión expirada

    // Cargar perfil del usuario
    getProfile(token)
      .then((p) => {
        if (p) {
          localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
          setProfile(p);
          setScreen("generate");
        } else {
          // Primera vez - no tiene perfil
          setScreen("profile");
        }
      })
      .catch((err) => {
        if (err.message === "TOKEN_EXPIRED") {
          handleTokenExpired();
        } else {
          // Si falla la carga del perfil, ir a crearlo
          setScreen("profile");
        }
      });
  }

  /**
   * Guarda el perfil y navega a la pantalla de generación
   */
  function handleProfileSaved(savedProfile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(savedProfile));
    setProfile(savedProfile);
    setScreen("generate");
  }

  /**
   * Maneja el logout
   */
  async function handleLogout() {
    // Intentar invalidar el token en el backend
    if (session?.token) {
      try {
        await logout(session.token);
      } catch (err) {
        // Si falla el logout en el backend, igual limpiamos localmente
        console.error("Error al cerrar sesión:", err);
      }
    }

    // Limpiar todo el estado local
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(PROFILE_KEY);
    setSession(null);
    setProfile(null);
    setSessionExpiredMessage(null);
    setScreen("login");
  }

  /**
   * Maneja cuando el token JWT expira
   */
  function handleTokenExpired() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(PROFILE_KEY);
    setSession(null);
    setProfile(null);
    setSessionExpiredMessage(
      "Tu sesión expiró. Por favor, iniciá sesión de nuevo.",
    );
    setScreen("login");
  }

  const skipLink = (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded"
    >
      Saltar al contenido
    </a>
  );

  if (screen === "loading") return null;

  if (screen === "login") {
    return (
      <>
        {skipLink}
        <LoginScreen
          onLogin={handleLogin}
          expiredMessage={sessionExpiredMessage}
        />
      </>
    );
  }

  if (screen === "profile") {
    return (
      <>
        {skipLink}
        <ProfileScreen
          token={session.token}
          user={session.user}
          initialProfile={profile}
          onSaved={handleProfileSaved}
          onTokenExpired={handleTokenExpired}
          onSkip={profile ? () => setScreen("generate") : null}
        />
      </>
    );
  }

  return (
    <>
      {skipLink}
      <GenerateScreen
        token={session.token}
        user={session.user}
        profile={profile}
        onEditProfile={() => setScreen("profile")}
        onLogout={handleLogout}
        onTokenExpired={handleTokenExpired}
      />
    </>
  );
}
