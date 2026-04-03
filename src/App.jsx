import { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import GenerateScreen from './components/GenerateScreen';
import './index.css';

const STORAGE_KEY = 'responde_session';

export default function App() {
  const [session, setSession] = useState(null); // { accessCode, data }
  const [checking, setChecking] = useState(true);

  // Restaurar sesión guardada
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSession(JSON.parse(saved));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setChecking(false);
  }, []);

  function handleLogin(accessCode, data) {
    const s = { accessCode, data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    setSession(s);
  }

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }

  if (checking) return null;

  if (!session) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <GenerateScreen
      accessCode={session.accessCode}
      initialData={session.data}
      onLogout={handleLogout}
    />
  );
}
